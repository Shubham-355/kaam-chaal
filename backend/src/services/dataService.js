import prisma from '../config/database.js';

class DataService {
  async upsertDistrict(record) {
    const district = await prisma.district.upsert({
      where: { districtCode: record.district_code },
      create: {
        districtCode: record.district_code,
        districtName: record.district_name,
        stateCode: record.state_code,
        stateName: record.state_name,
      },
      update: {
        districtName: record.district_name,
        stateName: record.state_name,
      },
    });

    return district;
  }

  async upsertDistrictRecord(districtId, record) {
    return await prisma.districtRecord.upsert({
      where: {
        districtId_finYear_month: {
          districtId,
          finYear: record.fin_year,
          month: record.month,
        },
      },
      create: {
        districtId,
        finYear: record.fin_year,
        month: record.month,
        approvedLabourBudget: this.parseBigInt(record.Approved_Labour_Budget),
        avgWageRate: this.parseFloat(record.Average_Wage_rate_per_day_per_person),
        avgDaysEmployment: this.parseInt(record.Average_days_of_employment_provided_per_Household),
        totalHouseholdsWorked: this.parseBigInt(record.Total_Households_Worked),
        totalIndividualsWorked: this.parseBigInt(record.Total_Individuals_Worked),
        totalActiveJobCards: this.parseBigInt(record.Total_No_of_Active_Job_Cards),
        totalActiveWorkers: this.parseBigInt(record.Total_No_of_Active_Workers),
        totalJobCardsIssued: this.parseBigInt(record.Total_No_of_JobCards_issued),
        totalWorkers: this.parseBigInt(record.Total_No_of_Workers),
        hhsCompleted100Days: this.parseBigInt(record.Total_No_of_HHs_completed_100_Days_of_Wage_Employment),
        scPersondays: this.parseBigInt(record.SC_persondays),
        scWorkers: this.parseBigInt(record.SC_workers_against_active_workers),
        stPersondays: this.parseBigInt(record.ST_persondays),
        stWorkers: this.parseBigInt(record.ST_workers_against_active_workers),
        womenPersondays: this.parseBigInt(record.Women_Persondays),
        differentlyAbledWorked: this.parseBigInt(record.Differently_abled_persons_worked),
        totalWorksCompleted: this.parseBigInt(record.Number_of_Completed_Works),
        totalWorksOngoing: this.parseBigInt(record.Number_of_Ongoing_Works),
        totalWorksTakenup: this.parseBigInt(record.Total_No_of_Works_Takenup),
        gpsWithNilExp: this.parseBigInt(record.Number_of_GPs_with_NIL_exp),
        totalExpenditure: this.parseFloat(record.Total_Exp),
        wages: this.parseFloat(record.Wages),
        materialWages: this.parseFloat(record.Material_and_skilled_Wages),
        adminExpenditure: this.parseFloat(record.Total_Adm_Expenditure),
        persondaysCentralLiability: this.parseBigInt(record.Persondays_of_Central_Liability_so_far),
        percentCategoryBWorks: this.parseInt(record.percent_of_Category_B_Works),
        percentAgriExpenditure: this.parseFloat(record.percent_of_Expenditure_on_Agriculture_Allied_Works),
        percentNRMExpenditure: this.parseFloat(record.percent_of_NRM_Expenditure),
        percentPayments15Days: this.parseFloat(record.percentage_payments_gererated_within_15_days),
        remarks: record.Remarks,
      },
      update: {
        approvedLabourBudget: this.parseBigInt(record.Approved_Labour_Budget),
        avgWageRate: this.parseFloat(record.Average_Wage_rate_per_day_per_person),
        avgDaysEmployment: this.parseInt(record.Average_days_of_employment_provided_per_Household),
        totalHouseholdsWorked: this.parseBigInt(record.Total_Households_Worked),
        totalIndividualsWorked: this.parseBigInt(record.Total_Individuals_Worked),
        totalActiveJobCards: this.parseBigInt(record.Total_No_of_Active_Job_Cards),
        totalActiveWorkers: this.parseBigInt(record.Total_No_of_Active_Workers),
        totalJobCardsIssued: this.parseBigInt(record.Total_No_of_JobCards_issued),
        totalWorkers: this.parseBigInt(record.Total_No_of_Workers),
        hhsCompleted100Days: this.parseBigInt(record.Total_No_of_HHs_completed_100_Days_of_Wage_Employment),
        scPersondays: this.parseBigInt(record.SC_persondays),
        scWorkers: this.parseBigInt(record.SC_workers_against_active_workers),
        stPersondays: this.parseBigInt(record.ST_persondays),
        stWorkers: this.parseBigInt(record.ST_workers_against_active_workers),
        womenPersondays: this.parseBigInt(record.Women_Persondays),
        differentlyAbledWorked: this.parseBigInt(record.Differently_abled_persons_worked),
        totalWorksCompleted: this.parseBigInt(record.Number_of_Completed_Works),
        totalWorksOngoing: this.parseBigInt(record.Number_of_Ongoing_Works),
        totalWorksTakenup: this.parseBigInt(record.Total_No_of_Works_Takenup),
        gpsWithNilExp: this.parseBigInt(record.Number_of_GPs_with_NIL_exp),
        totalExpenditure: this.parseFloat(record.Total_Exp),
        wages: this.parseFloat(record.Wages),
        materialWages: this.parseFloat(record.Material_and_skilled_Wages),
        adminExpenditure: this.parseFloat(record.Total_Adm_Expenditure),
        persondaysCentralLiability: this.parseBigInt(record.Persondays_of_Central_Liability_so_far),
        percentCategoryBWorks: this.parseInt(record.percent_of_Category_B_Works),
        percentAgriExpenditure: this.parseFloat(record.percent_of_Expenditure_on_Agriculture_Allied_Works),
        percentNRMExpenditure: this.parseFloat(record.percent_of_NRM_Expenditure),
        percentPayments15Days: this.parseFloat(record.percentage_payments_gererated_within_15_days),
        remarks: record.Remarks,
      },
    });
  }

  parseBigInt(value) {
    if (!value || value === 'NA') return null;
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  }

  parseFloat(value) {
    if (!value || value === 'NA') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }

  parseInt(value) {
    if (!value || value === 'NA') return null;
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  }

  async getDistrictsByState(state) {
    return await prisma.district.findMany({
      where: { stateName: state },
      orderBy: { districtName: 'asc' },
    });
  }

  async getDistrictData(districtCode, finYear) {
    const where = { district: { districtCode } };
    if (finYear) where.finYear = finYear;

    return await prisma.districtRecord.findMany({
      where,
      include: { district: true },
      orderBy: [{ finYear: 'desc' }, { month: 'desc' }],
    });
  }

  async getStates() {
    const states = await prisma.district.findMany({
      select: { stateName: true, stateCode: true },
      distinct: ['stateName'],
      orderBy: { stateName: 'asc' },
    });
    return states;
  }
}

export default new DataService();
