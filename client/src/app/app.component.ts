import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'client';

  private configuration: RTCConfiguration = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };
  private localstream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private offer: any = null;

  @ViewChild('local', { static: true })
  localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remote', { static: true })
  remoteVideo!: ElementRef<HTMLVideoElement>;

  constructor(private socket: Socket) {}

  async ngOnInit(): Promise<void> {
    this.socket.fromEvent('new-offer').subscribe(async (data: any) => {
      console.log('heeel');
      this.peerConnection = new RTCPeerConnection(this.configuration);
      this.createPeerConnection(this.peerConnection);
      const offer = new RTCSessionDescription(data.offer);
      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.socket.emit('answer', { type: 'answer', answer, offer });
    });

    this.socket.fromEvent('new-answer').subscribe(async (data: any) => {
      if (this.offer && this.offer.sdp == data.offer.sdp) {
        if (!this.peerConnection?.currentRemoteDescription) {
          const answer = new RTCSessionDescription(data.answer);
          this.peerConnection?.setRemoteDescription(answer);
          console.log('client connected');
        }
      }
    });

    this.socket.fromEvent('new-candidate').subscribe(async (data: any) => {
      console.log(data);
      const candidate = new RTCIceCandidate(data.candidate);
      await this.peerConnection?.addIceCandidate(candidate);
    });

    this.socket.fromEvent('notify-call-ended').subscribe(async (data: any) => {
      alert('Call ended');
      this.remoteVideo.nativeElement.srcObject = null;
      this.localVideo.nativeElement.srcObject = null;
    });
  }

  async startCall() {
    this.localstream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    this.localVideo.nativeElement.srcObject = this.localstream;
    this.peerConnection = new RTCPeerConnection(this.configuration);
    this.createPeerConnection(this.peerConnection);
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.offer = offer;
    this.socket.emit('offer', {
      type: 'offer',
      offer,
    });
  }

  async createPeerConnection(peerConnection: RTCPeerConnection) {
    this.remoteStream = new MediaStream();
    this.remoteVideo.nativeElement.srcObject = this.remoteStream;
    this.localstream
      ?.getTracks()
      .forEach((track) => peerConnection.addTrack(track, this.localstream!));

    peerConnection.ontrack = async (e) => {
      e.streams[0].getTracks().forEach((track) => {
        this.remoteStream?.addTrack(track);
        console.log('track');
      });
    };

    peerConnection.onicecandidate = async (e) => {
      if (e.candidate) {
        this.socket.emit('candidate', {
          type: 'candidate',
          candidate: e.candidate,
        });
      }
    };
  }

  async endCall() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.localstream?.getTracks().forEach((track) => {
      track.stop();
    });

    this.remoteStream?.getTracks().forEach((track) => {
      track.stop();
    });

    this.localVideo.nativeElement.srcObject = null;
    this.remoteVideo.nativeElement.srcObject = null;

    this.socket.emit('end-call', { type: 'end-call' });
  }
}
