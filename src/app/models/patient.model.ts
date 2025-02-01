export interface Patient {
    id: number;
    name: string;
}

export interface VitalSigns {
    patientId: number;
    heartRate: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    bodyTemperature: number;
    oxygenSaturation: number;
    timestamp: string;
}

export interface VitalSignsRecord extends VitalSigns {
    patientName: string;
    batchId: number;
}