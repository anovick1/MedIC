import { MarchData, TBIData, QwenRiskResult, DroneItem } from '../types';

export function encodeSquirt(params: {
  patientId: string;
  missionId: string;
  march: MarchData;
  tbi: TBIData;
  risk: QwenRiskResult;
  dronesNeeded: number;
  kit: DroneItem[];
}): string {
  const riskCode = { LOW: 'L', MODERATE: 'M', HIGH: 'H', CRITICAL: 'C' }[params.risk.level];
  const gcs = params.tbi.gcsEye + params.tbi.gcsVerbal + params.tbi.gcsMotor;
  const payload = {
    v: '1',
    pid: params.patientId,
    mid: params.missionId,
    risk: riskCode,
    gcs: String(gcs),
    pupils: params.tbi.pupils ?? 'UNK',
    moi: params.tbi.moi ?? 'UNK',
    prog: (params.tbi.neuroProgression ?? 'UNK').substring(0, 3),
    drones: params.dronesNeeded,
    kit: params.kit.filter(i => i.priority === 'CRITICAL').map(i => i.name.substring(0, 6).replace(/ /g, '')),
    bp_alert: params.march.otherInjuries !== 'NONE' && params.march.otherInjuries !== null,
    ts: Math.floor(Date.now() / 1000),
  };
  return JSON.stringify(payload);
}
