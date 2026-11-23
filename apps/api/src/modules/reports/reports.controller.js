import { successResponse } from '../../utils/response.js';

export class ReportsController {
  constructor(reportsService) {
    this.reportsService = reportsService;
  }

  dashboard = async (req, res, next) => {
    try {
      const metrics = await this.reportsService.getRoleDashboard({
        farmId: req.user.farmId,
        user: req.user
      });
      return successResponse(res, metrics);
    } catch (err) { next(err); }
  };

  cropProduction = async (req, res, next) => {
    try {
      const report = await this.reportsService.getCropProductionReport({
        farmId: req.user.farmId,
        seasonId: req.query.seasonId
      });

      // Handle CSV Export
      if (req.query.format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="crop-production-report.csv"');

        let csv = 'Batch Code,Crop,Field,Season,Planted Area,Unit,Total Harvested,Harvest Unit,Labor Cost,Status\n';
        for (const r of report) {
          csv += `"${r.batchCode}","${r.crop}","${r.field}","${r.season}",${r.plantedArea},"${r.areaUnit}",${r.totalHarvested},"${r.harvestUnit}",${r.laborCost},"${r.status}"\n`;
        }
        return res.send(csv);
      }

      return successResponse(res, report);
    } catch (err) { next(err); }
  };
}
