import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PatientMonitorComponent } from './components/patient-monitor/patient-monitor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PatientMonitorComponent],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {}