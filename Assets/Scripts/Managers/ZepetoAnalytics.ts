import { AnalyticsType, ZepetoAnalyticsComponent } from 'ZEPETO.Analytics';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import * as UnityEngine from "UnityEngine"
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Users, ZepetoWorldHelper } from 'ZEPETO.World';
import ClientStarter from '../Multiplay/ClientStarter';

export default class ZepetoAnalytics extends ZepetoScriptBehaviour {

    private analytics : ZepetoAnalyticsComponent;

    private clientStarter : ClientStarter;

    // private waitforSeconds : UnityEngine.WaitForSeconds;

    Start() {
        this.analytics = this.gameObject.GetComponent<ZepetoAnalyticsComponent>();
        // 모듈화 작업
        this.clientStarter = UnityEngine.GameObject.Find("ClientStarter").GetComponent<ClientStarter>();
        this.clientStarter.room != null
        // this.waitforSeconds = new UnityEngine.WaitForSeconds(0.01);
        this.GoogleAnalytics_SendLogEvent();
    }

    public GoogleAnalytics_SendLogEvent(){
        this.StartCoroutine(this.Coroutine_GoogleAnalytics_SendLogEvent());
    }

    *Coroutine_GoogleAnalytics_SendLogEvent(){
        let waitforSeconds = new UnityEngine.WaitForSeconds(0.01);
        while(true){
            yield waitforSeconds;
            if (this.clientStarter.room != null && this.clientStarter.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.clientStarter.room.SessionId);                            // Send Player Transform
                if (hasPlayer) {
                    break;
                }
            }
        }

        let tempUserIds = new Array();
        tempUserIds.push(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.userId);
        let zepetoId = "";
        ZepetoWorldHelper.GetUserIdInfo(tempUserIds,(info:Users[])=>{
            zepetoId = info[0].zepetoId;
            console.log(zepetoId + " : " + info[0].zepetoId);
        },(err)=>{
            console.error(err);
        });

        // 유저 아이디를 받아와서 이벤트 키로 설정하여 전송해야함
        while(true){
            yield waitforSeconds;
            if (zepetoId == "") continue;
            zepetoId = zepetoId.replace(/\./g, "점"); // '.' 이 들어간 키는 구글 애널리틱스 상에서 받아오지 못하는 오류가 발생하여 '점' 으로 임시 대체

            const time = new Date().toString();
            const google = this.analytics.Analytics(AnalyticsType.GoogleAnalytics);

            google.SetUserId(tempUserIds[0]);

            interface CustomEvent
            {
                AccessTime : string;
            }
            const eventParams:CustomEvent = {
                AccessTime : time,
            };
            
            google.LogEvent<CustomEvent>(zepetoId, eventParams);
            console.log(`google.LogEvent<CustomEvent>(${zepetoId}, ${eventParams.AccessTime})`);
            break;
        }
        this.StopCoroutine(this.Coroutine_GoogleAnalytics_SendLogEvent());
    }
}