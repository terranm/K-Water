import {Sandbox, SandboxOptions, SandboxPlayer} from "ZEPETO.Multiplay";
import {DataStorage} from "ZEPETO.Multiplay.DataStorage";
import {Player, ZepetoTransform, ZepetoVector3} from "ZEPETO.Multiplay.Schema";


export default class extends Sandbox {
    

    public readonly walkSpeed : number = 3;
    public readonly runSpeed : number = 5;
    public readonly jumpPower : number = 14;
    public readonly walkSpeedMax : number = 4;
    public readonly runSpeedMax : number = 8;
    public readonly jumpPowerMax : number = 20;

    storageMap:Map<string,DataStorage> = new Map<string, DataStorage>();
    
    constructor() {
        super();
    }

    onCreate(options: SandboxOptions) {

        // Room 객체가 생성될 때 호출됩니다.
        // Room 객체의 상태나 데이터 초기화를 처리 한다.

        this.onMessage("onChangedTransform", (client, message) => {
            try {
                const player = this.state.players.get(client.sessionId);

                const transform = new ZepetoTransform();
                transform.position = new ZepetoVector3();
                transform.position.x = message.position.x;
                transform.position.y = message.position.y;
                transform.position.z = message.position.z;
    
                transform.rotation = new ZepetoVector3();
                transform.rotation.x = message.rotation.x;
                transform.rotation.y = message.rotation.y;
                transform.rotation.z = message.rotation.z;
    
                player.transform = transform;
            } catch (error) {
                console.log(`[onChangedTransform] Error : ${error}`);
            }
            
        });

        this.onMessage("onChangedState", (client, message) => {
            try {
                const player = this.state.players.get(client.sessionId);
                player.state = message.state;
                player.subState = message.subState; // Character Controller V2
            } catch (error) {
                console.log(`[onChangedState] Error : ${error}`);
            }
        });

        // this.onMessage("onStatusUpgrade", (client, message) => {                                                  // Status Upgrade
        //     const player = this.state.players.get(client.sessionId);

        //     player.status.walkSpeed = message.status.walkSpeed;
        //     player.status.runSpeed  = message.status.runSpeed;
        //     player.status.jumpPower = message.status.jumpPower;

        //     this.state.players.set(client.sessionId, player);
        //     this.broadcast("onStatusUpdate", null);
        // });
        
        // this.onMessage("onStatusReset", (client, message) => {                                                    // Status Upgrade
        //     const player = this.state.players.get(client.sessionId);

        //     if(message.requestReset == true)
        //     {
        //         player.status.walkSpeed = this.walkSpeed;
        //         player.status.runSpeed  = this.runSpeed;
        //         player.status.jumpPower = this.jumpPower;
        //     }
        //     this.state.players.set(client.sessionId, player);
        //     this.broadcast("onStatusUpdate", null);
        // });

        // this.onMessage("Sit", (client, message) => {
        //     const player = this.state.players.get(client.sessionId);
        //     player.isSit = message;
        // });

        // this.onMessage('Gesture', (client, message) => {
        //     this.broadcast("Gesture", message as string, { except: client });

        // });

        // this.onMessage('GestureNum', (client, message) => {
        //     const player = this.state.players.get(client.sessionId);
        //     player.curgesture = message;
            
        //     this.broadcast("GestureNum", player.curgesture, { except: client });

        // });
        
        // this.onMessage("SL", (client, message) => {                                                             // Server Log
        //     console.log(`[${client.sessionId}] : ${message}`);
        // });
        
    }
    
   
    
    async onJoin(client: SandboxPlayer) {
        // if (this.state.players.)
        // this.kick(this.loadPlayer(client.sessionId));
        
        // schemas.json 에서 정의한 player 객체를 생성 후 초기값 설정.
        try {
            console.log(`[OnJoin] sessionId : ${client.sessionId}, HashCode : ${client.hashCode}, userId : ${client.userId}`)
            const player = new Player();
            player.sessionId = client.sessionId;
    
            if (client.hashCode) {
                player.zepetoHash = client.hashCode;
            }
            if (client.userId) {
                player.zepetoUserId = client.userId;
            }
    
            // [DataStorage] 입장한 Player의 DataStorage Load
            const storage: DataStorage = client.loadDataStorage();
    
            this.storageMap.set(client.sessionId,storage);
    
            let visit_cnt = await storage.get("VisitCount") as number;
            if (visit_cnt == null) visit_cnt = 0;
    
            console.log(`[OnJoin] ${client.sessionId}'s visiting count : ${visit_cnt}`)
    
            // [DataStorage] Player의 방문 횟수를 갱신한다음 Storage Save
            await storage.set("VisitCount", ++visit_cnt);

            this.state.players.set(client.sessionId, player);
        } catch (error) {
            console.log(`[OnJoin] Error : ${error}`);
        }


        // let number_arr = new Array();
        // number_arr.push("jumpPower");
        // number_arr.push("runSpeed");
        // number_arr.push("walkSpeed");
        // number_arr.forEach(async dataName => {
        //     let data = await storage.get(dataName) as number;                                           // [DataStorage] 데이터 로드 number
        //     switch(dataName)
        //     {
        //         case "walkSpeed" : 
        //             if(data == null) data = this.walkSpeed;
        //             player.status.walkSpeed = data;
        //             break;
        //         case "runSpeed" : 
        //             if(data == null) data = this.runSpeed;
        //             player.status.runSpeed = data;
        //             break;
        //         case "jumpPower" : 
        //             if(data == null) data = this.jumpPower;
        //             player.status.jumpPower = data;
        //             break;
        //     }
        //     console.log(`[OnJoin] ${client.sessionId}'s ${dataName} : ${data}`)
        //     await storage.set(dataName,data);                                                           // [DataStorage] 데이터 저장 number
        // });

        // let getNPC_A = await storage.get(`getNPC_A`) as boolean;
        // let getNPC_B = await storage.get(`getNPC_B`) as boolean;
        // let getNPC_C = await storage.get(`getNPC_C`) as boolean;
            
        // if(getNPC_A == null) getNPC_A = false;
        // if(getNPC_B == null) getNPC_B = false;
        // if(getNPC_C == null) getNPC_C = false;
        // player.getNPC.isGetA = getNPC_A;
        // player.getNPC.isGetB = getNPC_B;
        // player.getNPC.isGetC = getNPC_C;
        
        // await storage.set(`getNPC_A`,getNPC_A);
        // await storage.set(`getNPC_B`,getNPC_B);
        // await storage.set(`getNPC_C`,getNPC_C);

        // client 객체의 고유 키값인 sessionId 를 사용해서 Player 객체를 관리.
        // set 으로 추가된 player 객체에 대한 정보를 클라이언트에서는 players 객체에 add_OnAdd 이벤트를 추가하여 확인 할 수 있음.
    }

    onTick(deltaTime: number): void {
        //  서버에서 설정된 타임마다 반복적으로 호출되며 deltaTime 을 이용하여 일정한 interval 이벤트를 관리할 수 있음.
    }

    async onLeave(client: SandboxPlayer, consented?: boolean) {

        // allowReconnection 설정을 통해 순단에 대한 connection 유지 처리등을 할 수 있으나 기본 가이드에서는 즉시 정리.
        // delete 된 player 객체에 대한 정보를 클라이언트에서는 players 객체에 add_OnRemove 이벤트를 추가하여 확인 할 수 있음.

        // const player = this.state.players.get(client.sessionId);
        // const storage : DataStorage = client.loadDataStorage();

        // console.log(`[${client.sessionId}] status is saved...`);                                        // [DataStorage] status 데이터 저장
        // console.log(`====> ${player.status.walkSpeed}`);
        // console.log(`====> ${player.status.runSpeed}`);
        // console.log(`====> ${player.status.jumpPower}`);
        // console.log(`====> ${player.getNPC.isGetA}`);
        // console.log(`====> ${player.getNPC.isGetB}`);
        // console.log(`====> ${player.getNPC.isGetC}`);

        // await storage.set("walkSpeed", player.status.walkSpeed);
        // await storage.set("runSpeed", player.status.runSpeed);
        // await storage.set("jumpPower", player.status.jumpPower);
        // await storage.set(`getNPC_A`, player.getNPC.isGetA);
        // await storage.set(`getNPC_B`, player.getNPC.isGetB);
        // await storage.set(`getNPC_C`, player.getNPC.isGetC);
        try {
            console.log(`[OnLeave] sessionId : ${client.sessionId}, HashCode : ${client.hashCode}, userId : ${client.userId}`);
            this.state.players.delete(client.sessionId);
        } catch (error) {
            console.log(`[OnLeave] Error : ${error}`);
        }
    }
    
}