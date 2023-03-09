import { Transform } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class OtherPlayerManager extends ZepetoScriptBehaviour {

    public npcsPoint:Array<Transform>;
    
    Start()
    {
        this.tag = "OtherPlayer";                                                                   // "OtherPlayer" tag 추가
    }

}