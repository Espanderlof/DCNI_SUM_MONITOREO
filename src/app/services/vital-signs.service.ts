import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { VitalSigns, Patient, VitalSignsRecord } from '../models/patient.model';

@Injectable({
    providedIn: 'root'
})
export class VitalSignsService {
    private batchId = 0;
    private patients: Patient[] = [
        { id: 1, name: 'Juan Pérez' },
        { id: 2, name: 'María González' },
        { id: 7, name: 'Jaime Zapata' },
        { id: 23, name: 'Gonzalo Duran' },
        { id: 4, name: 'Carlos Soto' }
    ];

    private vitalSignsSubject = new BehaviorSubject<Map<number, VitalSigns>>(new Map());
    private historySubject = new BehaviorSubject<VitalSignsRecord[]>([]);

    vitalSigns$ = this.vitalSignsSubject.asObservable();
    history$ = this.historySubject.asObservable();

    constructor() {
        this.startVitalSignsSimulation();
    }

    getPatients(): Patient[] {
        return this.patients;
    }

    private startVitalSignsSimulation() {
        this.generateVitalSigns();
        interval(20000).subscribe(() => {
            this.generateVitalSigns();
        });
    }

    private generateVitalSigns() {
        const currentVitalSigns = new Map<number, VitalSigns>();
        const newRecords: VitalSignsRecord[] = [];
        this.batchId++;
        
        this.patients.forEach(patient => {
            const vitalSigns: VitalSigns = {
                patientId: patient.id,
                heartRate: this.randomInRange(60, 140),
                bloodPressureSystolic: this.randomInRange(90, 180),
                bloodPressureDiastolic: this.randomInRange(60, 120),
                bodyTemperature: this.randomInRange(36, 40),
                oxygenSaturation: this.randomInRange(90, 100),
                timestamp: new Date().toISOString()
            };
            
            currentVitalSigns.set(patient.id, vitalSigns);

            // Añadir al historial
            newRecords.push({
                ...vitalSigns,
                patientName: patient.name,
                batchId: this.batchId
            });
        });

        // Actualizar signos vitales actuales
        this.vitalSignsSubject.next(currentVitalSigns);

        // Actualizar historial manteniendo solo los últimos 50 registros
        const currentHistory = this.historySubject.value;
        const updatedHistory = [...newRecords, ...currentHistory].slice(0, 50);
        this.historySubject.next(updatedHistory);
    }

    private randomInRange(min: number, max: number): number {
        return +(Math.random() * (max - min) + min).toFixed(1);
    }
}