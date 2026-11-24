"""
Office-Grade Excel (.xlsx) Workbook Exporter for BB Bank Churn DSS.
Generates a clean ECMA-376 OOXML .xlsx file using Python's standard library
(zero external dependencies) with corporate styling, auto-fitted column widths,
frozen headers, AutoFilter, Excel number formats, and live SUM/AVERAGE formulas.
"""

from datetime import datetime
import io
import math
import re
from typing import Any, Dict, List
from xml.sax.saxutils import escape
import zipfile


def _col_letter(idx: int) -> str:
    """Convert 1-based column index to Excel column letters (1 -> A, 16 -> P)."""
    letters = []
    while idx > 0:
        idx, rem = divmod(idx - 1, 26)
        letters.append(chr(65 + rem))
    return "".join(reversed(letters))


def _sanitize_sheet_name(name: str) -> str:
    cleaned = re.sub(r"[\[\]:*?/\\]", " ", (name or "BB_Bank_Portfolio")).strip()
    return (cleaned[:31] or "BB_Bank_Portfolio").strip()


def _styles_xml() -> str:
    """Build ECMA-376 compliant styles.xml for executive banking spreadsheets."""
    # Custom numFmtId >= 164:
    # 164: #,##0
    # 165: #,##0.00 "€"
    # 166: 0.0%
    # 167: #,##0 "€"
    # 168: #,##0 "KH"
    # 169: #,##0 "KN"
    num_fmts = (
        '<numFmts count="6">'
        '<numFmt numFmtId="164" formatCode="#,##0"/>'
        '<numFmt numFmtId="165" formatCode="#,##0.00 &quot;€&quot;"/>'
        '<numFmt numFmtId="166" formatCode="0.0%"/>'
        '<numFmt numFmtId="167" formatCode="#,##0 &quot;€&quot;"/>'
        '<numFmt numFmtId="168" formatCode="#,##0 &quot;KH&quot;"/>'
        '<numFmt numFmtId="169" formatCode="#,##0 &quot;KN&quot;"/>'
        "</numFmts>"
    )

    fonts = (
        '<fonts count="9">'
        '<font><sz val="10"/><color rgb="FF0F172A"/><name val="Calibri"/></font>'  # 0: normal
        '<font><b/><sz val="13"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>'  # 1: banner white
        '<font><i/><sz val="10"/><color rgb="FF334155"/><name val="Calibri"/></font>'  # 2: subtitle
        '<font><b/><sz val="10"/><color rgb="FF0F172A"/><name val="Calibri"/></font>'  # 3: summary bold
        '<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>'  # 4: table header
        '<font><b/><sz val="10"/><color rgb="FF991B1B"/><name val="Calibri"/></font>'  # 5: critical red
        '<font><b/><sz val="10"/><color rgb="FF92400E"/><name val="Calibri"/></font>'  # 6: high amber
        '<font><b/><sz val="10"/><color rgb="FF166534"/><name val="Calibri"/></font>'  # 7: low emerald
        '<font><b/><sz val="10"/><color rgb="FF1D4ED8"/><name val="Calibri"/></font>'  # 8: Q1 VIP blue
        "</fonts>"
    )

    fills = (
        '<fills count="12">'
        '<fill><patternFill patternType="none"/></fill>'  # 0: required
        '<fill><patternFill patternType="gray125"/></fill>'  # 1: required
        '<fill><patternFill patternType="solid"><fgColor rgb="FF107C41"/></patternFill></fill>'  # 2: banner green
        '<fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>'  # 3: subtitle slate
        '<fill><patternFill patternType="solid"><fgColor rgb="FFE2E8F0"/></patternFill></fill>'  # 4: summary bar
        '<fill><patternFill patternType="solid"><fgColor rgb="FF1E3A8A"/></patternFill></fill>'  # 5: navy header
        '<fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/></patternFill></fill>'  # 6: even row
        '<fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/></patternFill></fill>'  # 7: zebra odd
        '<fill><patternFill patternType="solid"><fgColor rgb="FFFEE2E2"/></patternFill></fill>'  # 8: critical fill
        '<fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/></patternFill></fill>'  # 9: high fill
        '<fill><patternFill patternType="solid"><fgColor rgb="FFDCFCE7"/></patternFill></fill>'  # 10: low fill
        '<fill><patternFill patternType="solid"><fgColor rgb="FFDBEAFE"/></patternFill></fill>'  # 11: VIP blue fill
        "</fills>"
    )

    borders = (
        '<borders count="4">'
        "<border><left/><right/><top/><bottom/><diagonal/></border>"  # 0
        '<border>'
        '<left style="thin"><color rgb="FFCBD5E1"/></left>'
        '<right style="thin"><color rgb="FFCBD5E1"/></right>'
        '<top style="thin"><color rgb="FFCBD5E1"/></top>'
        '<bottom style="thin"><color rgb="FFCBD5E1"/></bottom>'
        "<diagonal/></border>"  # 1: thin grid
        '<border>'
        '<left style="thin"><color rgb="FF94A3B8"/></left>'
        '<right style="thin"><color rgb="FF94A3B8"/></right>'
        '<top style="thin"><color rgb="FF94A3B8"/></top>'
        '<bottom style="medium"><color rgb="FF0F172A"/></bottom>'
        "<diagonal/></border>"  # 2: header
        '<border>'
        '<left style="thin"><color rgb="FFCBD5E1"/></left>'
        '<right style="thin"><color rgb="FFCBD5E1"/></right>'
        '<top style="thin"><color rgb="FF94A3B8"/></top>'
        '<bottom style="thin"><color rgb="FF94A3B8"/></bottom>'
        "<diagonal/></border>"  # 3: summary
        "</borders>"
    )

    # Cell style index legend (xf indices):
    #  0: Default
    #  1: Title banner (font 1, fill 2, border 0, center/center)
    #  2: Subtitle bar (font 2, fill 3, border 1, left/center)
    #  3: Summary bar blank/text (font 3, fill 4, border 3, left/center)
    #  4: Summary count KH (font 3, fill 4, border 3, fmt 168, center/center)
    #  5: Summary sum EUR (font 3, fill 4, border 3, fmt 165, right/center)
    #  6: Summary avg % (font 3, fill 4, border 3, fmt 166, right/center)
    #  7: Summary sum cost EUR (font 3, fill 4, border 3, fmt 167, right/center)
    #  8: Summary sum complain KN (font 3, fill 4, border 3, fmt 169, center/center)
    #  9: Header (font 4, fill 5, border 2, center/center wrap)
    # 10: Even text left wrap
    # 11: Odd text left wrap
    # 12: Even text center
    # 13: Odd text center
    # 14: Even integer center (0)
    # 15: Odd integer center (0)
    # 16: Even Balance EUR right (fmt 165)
    # 17: Odd Balance EUR right (fmt 165)
    # 18: Even Cost EUR right (fmt 167)
    # 19: Odd Cost EUR right (fmt 167)
    # 20: Critical badge center (font 5, fill 8)
    # 21: High badge center (font 6, fill 9)
    # 22: Low badge center (font 7, fill 10)
    # 23: Critical % right (font 5, fill 8, fmt 166)
    # 24: High % right (font 6, fill 9, fmt 166)
    # 25: Low % right (font 7, fill 10, fmt 166)
    # 26: Q1 VIP Quadrant left (font 8, fill 11)
    cell_xfs = (
        '<cellXfs count="27">'
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
        '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>'
        '<xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" indent="1"/></xf>'
        '<xf numFmtId="0" fontId="3" fillId="4" borderId="3" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" indent="1"/></xf>'
        '<xf numFmtId="168" fontId="3" fillId="4" borderId="3" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'
        '<xf numFmtId="165" fontId="3" fillId="4" borderId="3" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'
        '<xf numFmtId="166" fontId="3" fillId="4" borderId="3" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'
        '<xf numFmtId="167" fontId="3" fillId="4" borderId="3" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'
        '<xf numFmtId="169" fontId="3" fillId="4" borderId="3" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'
        '<xf numFmtId="0" fontId="4" fillId="5" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>'
        '<xf numFmtId="0" fontId="0" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>'
        '<xf numFmtId="0" fontId="0" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>'
        '<xf numFmtId="0" fontId="0" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'
        '<xf numFmtId="0" fontId="0" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'
        '<xf numFmtId="0" fontId="0" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'
        '<xf numFmtId="0" fontId="0" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'
        '<xf numFmtId="165" fontId="0" fillId="6" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'
        '<xf numFmtId="165" fontId="0" fillId="7" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'
        '<xf numFmtId="167" fontId="0" fillId="6" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'
        '<xf numFmtId="167" fontId="0" fillId="7" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'
        '<xf numFmtId="0" fontId="5" fillId="8" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'
        '<xf numFmtId="0" fontId="6" fillId="9" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'
        '<xf numFmtId="0" fontId="7" fillId="10" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'
        '<xf numFmtId="166" fontId="5" fillId="8" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'
        '<xf numFmtId="166" fontId="6" fillId="9" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'
        '<xf numFmtId="166" fontId="7" fillId="10" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>'
        '<xf numFmtId="0" fontId="8" fillId="11" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>'
        "</cellXfs>"
    )

    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f"{num_fmts}{fonts}{fills}{borders}"
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        f"{cell_xfs}"
        '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
        "</styleSheet>"
    )


def _str_cell(ref: str, value: str, style_idx: int) -> str:
    return (
        f'<c r="{ref}" s="{style_idx}" t="inlineStr">'
        f'<is><t xml:space="preserve">{escape(value)}</t></is>'
        f"</c>"
    )


def _num_cell(ref: str, value: float, style_idx: int) -> str:
    return f'<c r="{ref}" s="{style_idx}"><v>{value}</v></c>'


def _formula_cell(ref: str, formula: str, style_idx: int) -> str:
    return f'<c r="{ref}" s="{style_idx}"><f>{escape(formula)}</f></c>'


def build_portfolio_excel_bytes(
    records: List[Dict[str, Any]],
    sheet_label: str = "Danh_Muc_Chinh",
    filter_summary: str = "Tất cả thị trường",
) -> bytes:
    """
    Build an office-formatted .xlsx binary workbook from scored customer records.
    """
    headers = [
        "STT",
        "Mã Khách Hàng",
        "Họ Khách Hàng",
        "Quốc Gia",
        "Giới Tính",
        "Tuổi",
        "Số Dư (EUR)",
        "Số SP",
        "Tương Tác",
        "Khiếu Nại",
        "Xác Suất Churn",
        "Phân Tầng Rủi Ro",
        "Góc Phần Tư (Quadrant)",
        "Chiến Lược Đề Xuất (NBA)",
        "Kênh Liên Hệ",
        "Chi Phí Dự Kiến",
    ]
    num_cols = len(headers)
    last_col = _col_letter(num_cols)
    first_data_row = 5
    last_data_row = max(first_data_row, first_data_row + len(records) - 1)

    # Initial minimum widths, then auto-fit cleanly from actual text length
    min_widths = [6, 15, 18, 13, 11, 8, 17, 8, 13, 11, 15, 18, 22, 42, 24, 16]
    max_widths = [8, 17, 24, 16, 13, 10, 21, 10, 15, 13, 18, 22, 28, 52, 32, 18]
    col_widths = [max(min_widths[i], len(headers[i]) + 3) for i in range(num_cols)]

    row_xmls: List[str] = []

    # Row 1: Corporate Banner Title
    banner_cells = [_str_cell("A1", "BB BANK AG — DANH SÁCH CHẤM ĐIỂM RỦI RO RỜI BỎ & CAN THIỆP KHÁCH HÀNG (RM CALL-LIST)", 1)]
    for c_idx in range(2, num_cols + 1):
        banner_cells.append(_str_cell(f"{_col_letter(c_idx)}1", "", 1))
    row_xmls.append(f'<row r="1" ht="34" customHeight="1">{"".join(banner_cells)}</row>')

    # Row 2: Subtitle Metadata
    export_time = datetime.now().strftime("%d/%m/%Y %H:%M")
    subtitle_text = (
        f"Phân vùng: {sheet_label}  |  Bộ lọc: {filter_summary}  |  "
        f"Mô hình: XGBoost Proactive (T* = 0,45)  |  Ngày xuất: {export_time}"
    )
    sub_cells = [_str_cell("A2", subtitle_text, 2)]
    for c_idx in range(2, num_cols + 1):
        sub_cells.append(_str_cell(f"{_col_letter(c_idx)}2", "", 2))
    row_xmls.append(f'<row r="2" ht="22" customHeight="1">{"".join(sub_cells)}</row>')

    # Row 3: Live Excel Formulas Summary Bar
    sum_cells: List[str] = []
    for c_idx in range(1, num_cols + 1):
        ref = f"{_col_letter(c_idx)}3"
        if c_idx == 1:
            sum_cells.append(_str_cell(ref, "TỔNG HỢP NHANH:", 3))
        elif c_idx == 2:
            sum_cells.append(_str_cell(ref, "", 3))
        elif c_idx == 3:
            if records:
                sum_cells.append(_formula_cell(ref, f"COUNTA(B{first_data_row}:B{last_data_row})", 4))
            else:
                sum_cells.append(_num_cell(ref, 0, 4))
        elif c_idx == 7:
            if records:
                sum_cells.append(_formula_cell(ref, f"SUM(G{first_data_row}:G{last_data_row})", 5))
            else:
                sum_cells.append(_num_cell(ref, 0, 5))
        elif c_idx == 10:
            if records:
                sum_cells.append(_formula_cell(ref, f"SUM(J{first_data_row}:J{last_data_row})", 8))
            else:
                sum_cells.append(_num_cell(ref, 0, 8))
        elif c_idx == 11:
            if records:
                sum_cells.append(_formula_cell(ref, f"AVERAGE(K{first_data_row}:K{last_data_row})", 6))
            else:
                sum_cells.append(_num_cell(ref, 0, 6))
        elif c_idx == 16:
            if records:
                sum_cells.append(_formula_cell(ref, f"SUM(P{first_data_row}:P{last_data_row})", 7))
            else:
                sum_cells.append(_num_cell(ref, 0, 7))
        else:
            sum_cells.append(_str_cell(ref, "", 3))
    row_xmls.append(f'<row r="3" ht="24" customHeight="1">{"".join(sum_cells)}</row>')

    # Row 4: Column Headers
    hdr_cells = [
        _str_cell(f"{_col_letter(i + 1)}4", h, 9) for i, h in enumerate(headers)
    ]
    row_xmls.append(f'<row r="4" ht="30" customHeight="1">{"".join(hdr_cells)}</row>')

    # Rows 5+: Data rows
    for idx, rec in enumerate(records):
        r_num = first_data_row + idx
        is_odd = (idx % 2) == 1
        left_s = 11 if is_odd else 10
        center_s = 13 if is_odd else 12
        int_s = 15 if is_odd else 14
        eur_s = 17 if is_odd else 16
        cost_s = 19 if is_odd else 18

        prob = float(rec.get("Predicted_Probability", 0.0))
        complain = int(rec.get("Complain", 0))
        risk_tier = str(rec.get("Risk_Tier", "LOW_RISK"))
        quadrant = str(rec.get("Quadrant", ""))
        strategy = str(rec.get("Recommended_Strategy", ""))
        channel = str(rec.get("Channel", ""))
        surname = str(rec.get("Surname", ""))
        geo = str(rec.get("Geography", ""))
        gender = str(rec.get("Gender", ""))
        age = int(rec.get("Age", 0))
        bal = float(rec.get("Balance", 0.0))
        prods = int(rec.get("NumOfProducts", 1))
        active = "Active (1)" if int(rec.get("IsActiveMember", 0)) == 1 else "Inactive (0)"
        cost = float(rec.get("Estimated_Cost_EUR", 0.0))
        cid = int(rec.get("CustomerId", 0))

        # Risk & highlight badge styles
        if prob >= 0.70 or "CRITICAL" in risk_tier:
            risk_badge_s = 20
            prob_badge_s = 23
        elif prob >= 0.45 or "HIGH" in risk_tier:
            risk_badge_s = 21
            prob_badge_s = 24
        else:
            risk_badge_s = 22
            prob_badge_s = 25

        complain_s = 20 if complain == 1 else int_s
        quad_s = 26 if "Q1" in quadrant else left_s

        # Track column widths
        str_samples = {
            2: surname,
            3: geo,
            4: gender,
            8: active,
            11: risk_tier,
            12: quadrant,
            13: strategy,
            14: channel,
        }
        for col_i, txt in str_samples.items():
            col_widths[col_i] = min(max_widths[col_i], max(col_widths[col_i], len(txt) + 3))

        # Calculate clean row height when Strategy/Channel wrap
        wrap_lines = max(
            1,
            math.ceil(max(len(strategy), 1) / max(col_widths[13] - 2, 20)),
            math.ceil(max(len(channel), 1) / max(col_widths[14] - 2, 16)),
        )
        row_ht = max(22, wrap_lines * 15 + 7)

        cells = [
            _num_cell(f"A{r_num}", idx + 1, int_s),
            _num_cell(f"B{r_num}", cid, int_s),
            _str_cell(f"C{r_num}", surname, left_s),
            _str_cell(f"D{r_num}", geo, center_s),
            _str_cell(f"E{r_num}", gender, center_s),
            _num_cell(f"F{r_num}", age, int_s),
            _num_cell(f"G{r_num}", bal, eur_s),
            _num_cell(f"H{r_num}", prods, int_s),
            _str_cell(f"I{r_num}", active, center_s),
            _num_cell(f"J{r_num}", complain, complain_s),
            _num_cell(f"K{r_num}", prob, prob_badge_s),
            _str_cell(f"L{r_num}", risk_tier, risk_badge_s),
            _str_cell(f"M{r_num}", quadrant, quad_s),
            _str_cell(f"N{r_num}", strategy, left_s),
            _str_cell(f"O{r_num}", channel, left_s),
            _num_cell(f"P{r_num}", cost, cost_s),
        ]
        row_xmls.append(f'<row r="{r_num}" ht="{row_ht}" customHeight="1">{"".join(cells)}</row>')

    cols_xml = "".join(
        f'<col min="{i + 1}" max="{i + 1}" width="{min(max_widths[i], col_widths[i]):.1f}" customWidth="1"/>'
        for i in range(num_cols)
    )

    sheet_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f'<dimension ref="A1:{last_col}{last_data_row}"/>'
        "<sheetViews>"
        '<sheetView tabSelected="1" workbookViewId="0">'
        '<pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/>'
        "</sheetView>"
        "</sheetViews>"
        '<sheetFormatPr defaultRowHeight="22"/>'
        f"<cols>{cols_xml}</cols>"
        f'<sheetData>{"".join(row_xmls)}</sheetData>'
        f'<autoFilter ref="A4:{last_col}{last_data_row}"/>'
        "<mergeCells count=\"3\">"
        f'<mergeCell ref="A1:{last_col}1"/>'
        f'<mergeCell ref="A2:{last_col}2"/>'
        '<mergeCell ref="A3:B3"/>'
        "</mergeCells>"
        '<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>'
        '<pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0" paperSize="9"/>'
        "</worksheet>"
    )

    clean_name = _sanitize_sheet_name(sheet_label)
    workbook_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        "<sheets>"
        f'<sheet name="{escape(clean_name)}" sheetId="1" r:id="rId1"/>'
        "</sheets>"
        "</workbook>"
    )

    content_types_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
        "</Types>"
    )

    root_rels_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        "</Relationships>"
    )

    wb_rels_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
        "</Relationships>"
    )

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types_xml.encode("utf-8"))
        zf.writestr("_rels/.rels", root_rels_xml.encode("utf-8"))
        zf.writestr("xl/workbook.xml", workbook_xml.encode("utf-8"))
        zf.writestr("xl/_rels/workbook.xml.rels", wb_rels_xml.encode("utf-8"))
        zf.writestr("xl/styles.xml", _styles_xml().encode("utf-8"))
        zf.writestr("xl/worksheets/sheet1.xml", sheet_xml.encode("utf-8"))
    return buf.getvalue()
