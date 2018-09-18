import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { HTTP } from '@ionic-native/http';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  matches: String[];
  isRecording = false;
  uri_api = 'http://201.73.146.245:8084/rest/SALDOPROD/';

  constructor(public navCtrl: NavController, private speechRecognition: SpeechRecognition, private cd: ChangeDetectorRef, private plt: Platform, private tts: TextToSpeech, private http: HttpClient) {
    
  }


  isIos() {
    return this.plt.is('ios');
  }

  startListening() {
    let options = {
      language: 'pt-BR'
    }
    this.speechRecognition.startListening(options).subscribe(matches => {
      this.matches = matches;
      this.verifica(matches[0]);
      this.cd.detectChanges();
    }, err => alert(JSON.stringify(err)));
    this.isRecording = true;
  }

  stopListening() {
    this.speechRecognition.stopListening().then(() => {
      this.isRecording = false;
    });
  }
 
  getPermission() {
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        }
      });
  }

  verifica(text) {
    if(text.includes("saldo do produto")) {

      let cod = text.slice(text.indexOf('produto') + 'produto'.length);
      cod = cod.trim();
      cod = cod.replace(/\s/g,'');
  
      this.uri_api += cod;
      
      this.http.get(this.uri_api).subscribe((response: any) => {
        alert(JSON.stringify(response));
        let msg;

        if(response.saldo == 0) {
          msg = 'Produto sem saldo'
        } else if(response.saldo == 1) {
          msg = 'Uma unidade disponível'
        } else {
          msg = response.saldo + ' unidades disponíveis'
        }

        this.tts.speak({locale: 'pt-BR', text: msg})
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log(reason));
      }, err => {
        alert(JSON.stringify(err));
        this.tts.speak({locale: 'pt-BR', text: 'Produto nao encontrado'})
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log(reason));
      });
      
    } else {
      this.tts.speak({locale: 'pt-BR', text: 'Não entendi'})
      .then(() => console.log('Success'))
      .catch((reason: any) => console.log(reason));
    }
  }
}
