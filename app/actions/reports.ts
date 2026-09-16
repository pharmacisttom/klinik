'use server';

import {
  buildCustomReport,
  ReportColumnConfig,
  ReportFilterConfig,
  StandardReportTemplates,
  ReportTemplateDefinition,
} from '@/lib/reports/report-builder';
import { logAudit } from '@/lib/security/audit';

export async function generateCustomReportAction(
  entity: string,
  columns: ReportColumnConfig[],
  filters: ReportFilterConfig
) {
  try {
    const data = await buildCustomReport(entity, columns, filters);

    await logAudit({
      userId: 'admin-user',
      action: 'GENERATE_CUSTOM_REPORT',
      resource: `Report:${entity}`,
      details: { rowCount: data.length, filters },
    });

    return { success: true, data, rowCount: data.length };
  } catch (error: any) {
    console.error('Error generating custom report:', error);
    return { success: false, error: 'ไม่สามารถสร้างรายงานตามคำขอได้' };
  }
}

export async function getPresetReportTemplatesAction(): Promise<{ success: boolean; templates: ReportTemplateDefinition[] }> {
  return {
    success: true,
    templates: [
      StandardReportTemplates.FDA_SCHEDULE_4_5,
      StandardReportTemplates.NCD_CHRONIC_CONTROL,
      StandardReportTemplates.REVENUE_TAX_SUMMARY,
    ],
  };
}

/**
 * Intelligent Smart Template Import Parser
 */
export async function parseImportedReportTemplateAction(jsonContent: string) {
  try {
    const parsed = JSON.parse(jsonContent);
    if (!parsed.entity || !parsed.columns || !Array.isArray(parsed.columns)) {
      return { success: false, error: 'รูปแบบไฟล์เทมเพลตไม่ถูกต้อง (ต้องประกอบด้วย entity และ columns)' };
    }

    return { success: true, template: parsed as ReportTemplateDefinition };
  } catch (error: any) {
    return { success: false, error: 'ไม่สามารถอ่านไฟล์เทมเพลต JSON ได้' };
  }
}
