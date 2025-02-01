import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VitalSignsService } from '../../services/vital-signs.service';
import { Patient, VitalSigns, VitalSignsRecord } from '../../models/patient.model';

@Component({
    selector: 'app-patient-monitor',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './patient-monitor.component.html',
    styleUrls: ['./patient-monitor.component.scss']
})
export class PatientMonitorComponent implements OnInit {
    patients: Patient[] = [];
    vitalSigns: Map<number, VitalSigns> = new Map();
    history: VitalSignsRecord[] = [];
    summaryInfo: { 
        minutes: number, 
        seconds: number,
        nextSummaryMinutes: number,
        nextSummarySeconds: number 
    } = { 
        minutes: 0, 
        seconds: 0,
        nextSummaryMinutes: 5,
        nextSummarySeconds: 0
    };

    constructor(private vitalSignsService: VitalSignsService) {}

    ngOnInit() {
        this.patients = this.vitalSignsService.getPatients();
        this.vitalSignsService.vitalSigns$.subscribe(
            vitalSigns => this.vitalSigns = vitalSigns
        );
        this.vitalSignsService.history$.subscribe(
            history => this.history = history
        );
        this.vitalSignsService.summary$.subscribe(
            summary => this.summaryInfo = summary
        );
    }

    getVitalSignsForPatient(patientId: number): VitalSigns | undefined {
        return this.vitalSigns.get(patientId);
    }
}