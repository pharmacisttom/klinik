import { prisma } from '@/lib/prisma';

export interface Moph43ExportResult {
  personTxt: string;
  serviceTxt: string;
  diagnosisOpdTxt: string;
  drugOpdTxt: string;
  chronicTxt: string;
  totalRecords: number;
}

/**
 * MOPH 43-แฟ้ม Standard Exporter
 * Generates pipe-delimited (|) text format for Ministry of Public Health data reporting.
 */
export async function generateMoph43Export(): Promise<Moph43ExportResult> {
  const patients = await prisma.patient.findMany({
    include: {
      appointments: {
        include: {
          prescription: {
            include: {
              items: {
                include: { medication: true },
              },
            },
          },
        },
      },
    },
  });

  const personLines: string[] = ['HOSPCODE|PID|HN|CID|PRENAME|NAME|LNAME|SEX|BIRTH|MSTATUS|OCCUPATION|NATION'];
  const serviceLines: string[] = ['HOSPCODE|PID|HN|SEQ|DATE_SERV|TIME_SERV|LOCATION|CHIEFCOMP'];
  const diagLines: string[] = ['HOSPCODE|PID|HN|SEQ|DATE_SERV|DIAGTYPE|DIAGCODE|CLINIC'];
  const drugLines: string[] = ['HOSPCODE|PID|HN|SEQ|DATE_SERV|DIDSTD|AMOUNT|DRUGPRICE|DRUGCOST'];
  const chronicLines: string[] = ['HOSPCODE|PID|HN|CHRONIC|DATEDX'];

  const hospCode = '10105'; // Sample MOPH Clinic Hospital Code

  let recordCount = 0;

  for (const patient of patients) {
    const dobFormatted = patient.dateOfBirth.toISOString().slice(0, 10).replace(/-/g, '');
    personLines.push(
      `${hospCode}|${patient.id}|${patient.hn}|${patient.nationalId}|${patient.prefix}|${patient.firstName}|${patient.lastName}|${patient.gender === 'MALE' ? '1' : '2'}|${dobFormatted}|1|000|099`
    );
    recordCount++;

    // Parse chronic diseases
    try {
      const chronics: string[] = JSON.parse(patient.chronicDiseases || '[]');
      for (const chronic of chronics) {
        chronicLines.push(`${hospCode}|${patient.id}|${patient.hn}|I10|20260101`);
        recordCount++;
      }
    } catch (e) {}

    for (const appt of patient.appointments) {
      const dateServ = appt.scheduledAt.toISOString().slice(0, 10).replace(/-/g, '');
      const timeServ = appt.scheduledAt.toTimeString().slice(0, 5).replace(':', '');
      const seq = appt.id.slice(0, 8);

      serviceLines.push(
        `${hospCode}|${patient.id}|${patient.hn}|${seq}|${dateServ}|${timeServ}|01|${appt.chiefComplaint || ''}`
      );
      recordCount++;

      if (appt.diagnosisCode) {
        diagLines.push(
          `${hospCode}|${patient.id}|${patient.hn}|${seq}|${dateServ}|1|${appt.diagnosisCode}|01`
        );
        recordCount++;
      }

      if (appt.prescription && appt.prescription.items) {
        for (const item of appt.prescription.items) {
          const tmt = item.medication.tmtCode || '100000000000000000000000';
          drugLines.push(
            `${hospCode}|${patient.id}|${patient.hn}|${seq}|${dateServ}|${tmt}|${item.quantity}|${item.unitPrice}|${item.unitPrice * 0.7}`
          );
          recordCount++;
        }
      }
    }
  }

  return {
    personTxt: personLines.join('\n'),
    serviceTxt: serviceLines.join('\n'),
    diagnosisOpdTxt: diagLines.join('\n'),
    drugOpdTxt: drugLines.join('\n'),
    chronicTxt: chronicLines.join('\n'),
    totalRecords: recordCount,
  };
}
