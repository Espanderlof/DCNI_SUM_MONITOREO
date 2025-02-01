// src/app/services/vital-signs.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { VitalSigns, Patient, VitalSignsRecord } from '../models/patient.model';

@Injectable({
    providedIn: 'root'
})
export class VitalSignsService {
    private batchId = 0;
    private startTime: Date;
    private summaryCounter = 0;
    private readonly SUMMARY_INTERVAL = 5; // 5 minutos

    private summaryCounterSubject = new BehaviorSubject<{
        minutes: number,
        seconds: number,
        nextSummaryMinutes: number,
        nextSummarySeconds: number
    }>({ 
        minutes: 0, 
        seconds: 0,
        nextSummaryMinutes: this.SUMMARY_INTERVAL,
        nextSummarySeconds: 0
    });

    summary$ = this.summaryCounterSubject.asObservable();

    private endpoints = [
        'http://172.210.177.28:8082/api/vitalsigns',
        'http://172.210.177.28:8084/api/vitalsigns'
    ];

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

    constructor(private http: HttpClient) {
        this.startTime = new Date();
        this.startVitalSignsSimulation();
        this.startSummaryCounter();
    }

    private startSummaryCounter() {
        interval(1000).subscribe(() => {
            const currentTime = new Date();
            const elapsedTotalSeconds = Math.floor((currentTime.getTime() - this.startTime.getTime()) / 1000);
            const elapsedMinutes = Math.floor(elapsedTotalSeconds / 60);
            const elapsedSeconds = elapsedTotalSeconds % 60;

            const secondsUntilNextSummary = (this.SUMMARY_INTERVAL * 60) - (elapsedTotalSeconds % (this.SUMMARY_INTERVAL * 60));
            const nextSummaryMinutes = Math.floor(secondsUntilNextSummary / 60);
            const nextSummarySeconds = secondsUntilNextSummary % 60;

            this.summaryCounterSubject.next({
                minutes: elapsedMinutes,
                seconds: elapsedSeconds,
                nextSummaryMinutes: nextSummaryMinutes,
                nextSummarySeconds: nextSummarySeconds
            });

            if (elapsedTotalSeconds > 0 && elapsedTotalSeconds % (this.SUMMARY_INTERVAL * 60) === 0) {
                this.sendSummary();
            }
        });
    }  

    private sendSummary() {
        const summary = {
            timestamp: new Date().toISOString(),
            totalMinutesElapsed: Math.floor((new Date().getTime() - this.startTime.getTime()) / 60000),
            totalBatches: this.batchId,
        };

        console.log('Enviando resumen de 5 minutos:', summary);
    }

    getPatients(): Patient[] {
        return this.patients;
    }

    private startVitalSignsSimulation() {
        this.generateVitalSigns();
        interval(10000).subscribe(() => {
            this.generateVitalSigns();
        });
    }

    private generateVitalSigns() {
        const currentVitalSigns = new Map<number, VitalSigns>();
        const newRecords: VitalSignsRecord[] = [];
        this.batchId++;
        
        this.patients.forEach(patient => {
            // Probabilidad del 20% de generar valores anormales
            const generateAbnormal = Math.random() < 0.2;
            
            const vitalSigns: VitalSigns = {
                patientId: patient.id,
                // Normal: 60-100, Anormal: 40-140
                heartRate: generateAbnormal ? 
                    this.randomInRange(40, 140) : 
                    this.randomInRange(60, 100),
    
                // Normal: 90-140, Anormal: 80-180
                bloodPressureSystolic: generateAbnormal ? 
                    this.randomInRange(80, 180) : 
                    this.randomInRange(90, 140),
    
                // Normal: 60-90, Anormal: 50-120
                bloodPressureDiastolic: generateAbnormal ? 
                    this.randomInRange(50, 120) : 
                    this.randomInRange(60, 90),
    
                // Normal: 36.5-37.5, Anormal: 36-39
                bodyTemperature: generateAbnormal ? 
                    this.randomInRange(36, 39) : 
                    this.randomInRange(36.5, 37.5),
    
                // Normal: >95, Anormal: 85-100
                oxygenSaturation: generateAbnormal ? 
                    this.randomInRange(85, 100) : 
                    this.randomInRange(95, 100),
    
                timestamp: new Date().toISOString()
            };
            
            currentVitalSigns.set(patient.id, vitalSigns);
            
            const record: VitalSignsRecord = {
                ...vitalSigns,
                patientName: patient.name,
                batchId: this.batchId
            };
            newRecords.push(record);
            
            this.sendToEndpoints(vitalSigns);
        });
    
        this.vitalSignsSubject.next(currentVitalSigns);
        
        const currentHistory = this.historySubject.value;
        const updatedHistory = [...newRecords, ...currentHistory].slice(0, 50);
        this.historySubject.next(updatedHistory);
    }

    private sendToEndpoints(vitalSigns: VitalSigns) {
        const requests = this.endpoints.map(endpoint => 
            this.http.post(endpoint, vitalSigns).pipe(
                catchError(error => {
                    console.error(`Error sending data to ${endpoint}:`, error);
                    // Retornamos null para que forkJoin no se detenga si un endpoint falla
                    return [null];
                })
            )
        );

        // Enviar a todos los endpoints en paralelo
        forkJoin(requests).subscribe({
            next: (responses) => {
                console.log(`Vital signs sent successfully for patient ${vitalSigns.patientId}`);
            },
            error: (error) => {
                console.error('Error sending vital signs:', error);
            }
        });
    }

    private randomInRange(min: number, max: number): number {
        return +(Math.random() * (max - min) + min).toFixed(1);
    }
}