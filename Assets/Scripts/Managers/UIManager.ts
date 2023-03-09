import { Canvas, Color, GameObject, Mathf, Time, Vector2, Vector3, WaitForFixedUpdate, WaitForSeconds } from "UnityEngine";
import { Button, Image, Text } from "UnityEngine.UI";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import MapController from "../MapController";
import GameBaseData from "./GameBaseData";
import GameManager from "./GameManager";


enum FadeType {
    Fallout = "UI_Fade_Black",
    Teleport = "UI_Fade_White",
    NONE = "",
}
enum LoadingType {
    Start = "UI_Loarding_Start",
    Teleport = "UI_Loarding_Teleport",
    NONE = "",
}
// enum PopUpType {
//     TypeA = "UI_POP_01",
//     TypeB = "UI_POP_02",
//     TypeC = "UI_POP_03",
//     TypeD = "UI_POP_04",
//     TypeM = "UI_MAP",
//     NONE = "",
// }


export default class UIManager extends ZepetoScriptBehaviour {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton
    private static _instance: UIManager;
    public static get instance(): UIManager { return UIManager._instance; }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property
    public get FADE_FALLOUT()      :FadeType { return FadeType.Fallout; }
    public get FADE_TELEPORT()     :FadeType { return FadeType.Teleport; }
    public get FADE_NONE()         :FadeType { return FadeType.NONE; }

    // public get LOADING_START()     :LoadingType { return LoadingType.Start; }
    // public get LOADING_TELEPORT()  :LoadingType { return LoadingType.Teleport; }
    // public get LOADING_NONE()      :LoadingType { return LoadingType.NONE; }
    
    // public get POPUP_A()           :PopUpType { return PopUpType.TypeA; }
    // public get POPUP_B()           :PopUpType { return PopUpType.TypeB; }
    // public get POPUP_C()           :PopUpType { return PopUpType.TypeC; }
    // public get POPUP_D()           :PopUpType { return PopUpType.TypeD; }
    // public get POPUP_MAP()         :PopUpType { return PopUpType.TypeM; }
    // public get POPUP_NULL()        :PopUpType { return PopUpType.NONE; }

    @SerializeField()
    private canvas : Canvas;

    private fadeImages : GameObject[];
    private loadingUIs : GameObject[];
    private questUIs : GameObject[];
    private popUps : GameObject[];
    private EffUIs : GameObject[];
    private mapButton : Button;
    private timerUI : GameObject;
    private questCntUI : GameObject;

    private openUI:GameObject;

    private animTime : number = 1.5;
    private readonly start : number = 1;
    private readonly end : number = 0;

    private isPlaying : boolean;
    private isLoading : boolean;

    private questCount:number = 0;

    // private waitForFixedUpdate :WaitForFixedUpdate;
    // private waitForSeconds : WaitForSeconds;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting
    Start()
    {
        UIManager._instance = this;

        if(this.canvas == null)
            return;

        const images = this.canvas.GetComponentsInChildren<Image>();
        this.fadeImages = new Array<GameObject>();
        this.loadingUIs = new Array<GameObject>();
        this.questUIs = new Array<GameObject>();
        this.popUps = new Array<GameObject>();
        this.EffUIs = new Array<GameObject>();
        
        for(const img of images)
        {
            try {
                switch(img.tag)
                {
                    case "Fade": 
                        this.fadeImages.push(img.gameObject);
                        let fadeColor : Color = img.color;
                        fadeColor.a = 0;
                        img.color = fadeColor;
                        break;
                    case "Loading": 
                        this.loadingUIs.push(img.gameObject);
                        img.gameObject.SetActive(false);
                        break;
                    case "Quest": 
                        this.questUIs.push(img.gameObject);
                        if (img.name.split('_')[2] == "02")
                            continue;
                        const bntExitQuest = img.GetComponentsInChildren<Button>();         // Exit Button
                        bntExitQuest.forEach((btn)=>{
                            btn.onClick.AddListener(() => {
                                img.gameObject.SetActive(false);
                            });
                        });
                        img.gameObject.SetActive(false);
                    case "POP": 
                        this.popUps.push(img.gameObject);

                        const bntExitPOP = img.GetComponentInChildren<Button>();          // Exit Button
                        bntExitPOP.onClick.AddListener(() => {
                            img.gameObject.SetActive(false);
                        });
                        if (img.name == "UI_MAP"){
                            bntExitPOP.onClick.AddListener(() => {
                                const mapController = img.GetComponent<MapController>();
                                if(mapController)
                                    mapController.StopTracingPlayer();
                            });
                        }
                        img.gameObject.SetActive(false);
                        break;
                    case "Eff":
                        this.EffUIs.push(img.gameObject);
                        img.gameObject.SetActive(false);
                        break;
                }
                
            } catch (error) {
                console.error(error, img.name);
            }
        }

        this.questUIs[1].GetComponentsInChildren<Button>().forEach((btn)=>{
            let btname = btn.name.split('_');
            btn.onClick.AddListener(()=>{
                if (btname[1] != "Move"){
                    GameManager.instance.QuestStart();
                    this.questUIs[1].SetActive(false);
                }
                else{
                    switch (btname[2]) {
                        case "Next":
                            this.questUIs[1].transform.GetChild(0).gameObject.SetActive(false);
                            this.questUIs[1].transform.GetChild(1).gameObject.SetActive(true);
                            break;
                        case "Prev":
                            this.questUIs[1].transform.GetChild(1).gameObject.SetActive(false);
                            this.questUIs[1].transform.GetChild(0).gameObject.SetActive(true);
                            break;
                    }
                }
            });
        });
        this.questUIs[1].transform.GetChild(0).gameObject.SetActive(true);
        this.questUIs[1].transform.GetChild(1).gameObject.SetActive(false);
        this.questUIs[1].SetActive(false);

        let mainUi = this.canvas.transform.GetChild(0);
        this.mapButton = mainUi.GetChild(0).GetComponent<Button>();
        if(this.mapButton)
        {
            this.mapButton.onClick.AddListener(
                () => {
                    this.SetOnClickListener(this.mapButton);
                }
            );
            // this.mapButton.gameObject.SetActive(false);
        }
        this.timerUI = mainUi.GetChild(1).gameObject;
        this.timerUI.SetActive(false);
        this.questCntUI = mainUi.GetChild(2).gameObject;
        this.questCntUI.SetActive(false);
        mainUi.GetChild(3).gameObject.SetActive(false);
        mainUi.GetChild(4).gameObject.SetActive(false);

        // this.waitForFixedUpdate = new WaitForFixedUpdate();// GameBaseData.instance.WaitForFixed_Update;
        // this.waitForSeconds = new WaitForSeconds(1);
        // this.timerText = this.timerUI.GetComponentInChildren<Text>();
    }

    public SetQuestCntImg(num : number){
        if (num > 0){
            console.log("setquestimg ",this.canvas.transform.GetChild(0).GetChild(num+2).name);
            this.canvas.transform.GetChild(0).GetChild(2).GetComponent<Image>().sprite = this.canvas.transform.GetChild(0).GetChild(num+2).GetComponent<Image>().sprite;
        }
    }

    private SetOnClickListener(btn:Button)
    {
        switch(btn.name)
        {
            default:
                this.ShowPopUp("UI_MAP");
                break;
        }
    }

    // Start()
    // {    

    // }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// public
    public PlayFadeInOut(type:FadeType, animTime : number = this.animTime)
    {
        this.StartCoroutine(this.FadeCoroutine(type, false, animTime, true));
    }
    public PlayLoading()
    {
        this.StartCoroutine(this.LoadingCoroutine());
    }
    public ShowPopUp(type:string)
    {
        this.PopUpCoroutine(type);
    }
    public StopLoading()
    {
        const loadingImage = this.loadingUIs[0];
        this.isLoading = false;
        this.isPlaying = false;
        this.CloseUI(loadingImage);
    }

    public PlayEff(num : number){
        this.StartCoroutine(this.EffCoroutine(num));
    }

    public ClosePopup(type:string)
    {
        const pop = this.FindPopUpImage(type);
        this.CloseUI(pop);
    }
    private timerState : boolean = false;
    public SetTimer(state:boolean){
        this.timerState = state;
        this.timerUI.SetActive(true);
        
        this.StopCoroutine(this.TimerCnt());
        if (this.timerState){
            this.StartCoroutine(this.TimerCnt());
        }
    }
    public SetQuestCnt(state:boolean, cnt : number){
        this.questCntUI.SetActive(state);
        if (!state) return;
        let queCntTextImgs = this.questCntUI.GetComponentsInChildren<Image>();
        queCntTextImgs.shift();
        let imgNum = 0;
        queCntTextImgs.forEach((img)=>{
            img.enabled = (imgNum++ == cnt);
        });
        
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// public END
    private *TimerCnt(){
        let timeText = this.timerUI.GetComponentInChildren<Text>();
        let time = 0;
        while(this.timerState){
            yield new WaitForFixedUpdate();//GameBaseData.instance.WaitForFixed_Update;//
            time += Time.deltaTime;
            timeText.text = (Math.floor(time)).toString();
        }
        this.StopCoroutine(this.TimerCnt());
    }
    // private timerTime:number;
    // private isTimerOn:boolean;
    // private timerText:Text;
    // Update(){
    //     if (this.isTimerOn){
    //         // console.log("this.timerTime" + this.timerText.text);
    //         this.timerTime += Time.deltaTime;
    //         this.timerUI.GetComponentInChildren<Text>().text = (Math.floor(this.timerTime)).toString();
    //     }
    // }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Fade
    private * FadeCoroutine(type:FadeType, isFadeIn : boolean, aniTime : number = this.animTime, returnSignal : boolean = false)
    {
        if(this.isPlaying || this.isLoading)
            return;

        const fadeImage = this.FindFadeImage(type);
        if(fadeImage == null)
        {
            console.error(` ----------------- fadeImage == null & type : ${type} `);
            return;
        }

        this.isPlaying = true;
        const counter = aniTime / 100000;                                                                      // Timer Set
        let timer = 0;
        
        let startAlpha = this.start;                                                                           // Default Set (Fade In)
        let endAlpha = this.end;
        if(!isFadeIn)
        {
            startAlpha = this.end;                                                                             // Fade Out Set
            endAlpha = this.start;
        }
        // let waitForFixedUpdate = new WaitForFixedUpdate();
        while(timer < aniTime)
        {
            yield GameBaseData.instance.WaitForFixed_Update; //new WaitForFixedUpdate();//waitForFixedUpdate;                                                                    // 정상적으로 동작하는 것은 이것뿐
            timer += Time.deltaTime;

            // yield new WaitForSecondsRealtime(counter);
            // timer += counter;                                                                               // TEST
            // timer += counter * 100;                                                                         // PC
            // timer += counter * 1500;                                                                        // Mobile
            let fadeColor : Color = fadeImage.color;
            fadeColor.a = Mathf.Lerp(startAlpha, endAlpha, timer);
            fadeImage.color = fadeColor;
        }

        this.isPlaying = false;
        if(returnSignal)
            this.StartCoroutine(this.FadeCoroutine(type, !isFadeIn, aniTime, false));
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Fade END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Loading
    private * LoadingCoroutine()
    {
        if(this.isPlaying || this.isLoading)
            return;

        const loadingImage = this.loadingUIs[0];
        this.openUI = loadingImage;
        if(loadingImage == null)
        {
            console.error(` ----------------- loadingImage == null`);
            return;
        }

        this.isPlaying = true;
        this.isLoading = true;

        loadingImage.SetActive(true);
        const sublodingImg = loadingImage.transform.GetChild(0);
        let y = 0;
        let isPlus = true;
        // let waitForFixedUpdate = new WaitForFixedUpdate();
        while(this.isLoading)
        {
            yield new WaitForFixedUpdate();//waitForFixedUpdate;//GameBaseData.instance.WaitForFixed_Update;//
            
            let move;
            if (isPlus){
                move = Time.deltaTime * 50;
            }
            else {
                move = Time.deltaTime * -50;
            }

            if (sublodingImg.localPosition.y > 50){
                isPlus = false;
            }
            else if (sublodingImg.localPosition.y < -50){
                isPlus = true;
            }
            y += move;
            // console.log("y : ",y);
            sublodingImg.localPosition = new Vector3(0,y,0);
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Loading END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Pop Up
    private PopUpCoroutine(type:string)
    {
        const pop = this.FindPopUpImage(type);
        if(pop == null)
        {
            console.error(` ----------------- pop == null & type : ${type} `);
            return;
        }

        if(pop.activeSelf)
        {
            this.CloseUI(pop);
        }
        else
        {
            this.openUI = pop;
            pop.SetActive(true);
            if (pop.name == "UI_MAP"){
                const mapController = pop.GetComponent<MapController>();
                if(mapController)
                    mapController.StartTracingPlayer();
            }
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Pop Up END
    private *EffCoroutine(num : number){
        const eff = this.EffUIs[num];
        if(eff == null)
        {
            console.error(` ----------------- pop == null & type : ${num} `);
            return;
        }
        if(eff.activeSelf)
        {
            this.CloseUI(eff);
        }
        else
        {
            this.openUI = eff;
            let x_Scale = 0;
            let y_Scale = 0;
            eff.transform.localScale = new Vector3(x_Scale,y_Scale,1);
            eff.SetActive(true);
            while(true){
                yield null;
                if (x_Scale > 1){
                    break;
                }
                x_Scale += Time.deltaTime;
                y_Scale += Time.deltaTime;
                eff.transform.localScale = new Vector3(x_Scale,y_Scale,1);
            }  
            yield new WaitForSeconds();//this.waitForSeconds //GameBaseData.instance.WaitForSecond_1; //GameBaseData.instance.WaitForSecond_1;//
            this.CloseUI(eff);       
        }

    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Quest
    public StartQuest()
    {
        if(this.questUIs.length < this.questCount)
            return;
            
        // this.mapButton.gameObject.SetActive(true);
        this.questUIs[this.questCount].SetActive(true);
        return this.questCount++;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Quest END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// UI Close
    private CloseUI(ui:GameObject)
    {
        if(ui == null)
        {
            console.error(` ----------------- ui == null`);
            return;
        }
        if (ui.name == "UI_MAP"){
            const mapController = ui.GetComponent<MapController>();
            if(mapController)
                mapController.StopTracingPlayer();
        }

        ui.SetActive(false);
        this.openUI = null;
        // this.StopAllCoroutines();
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// UI Close END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Find GameObject
    FindFadeImage(type:FadeType) : Image
    {
        const typeName :string = type as string;
        for (const item of this.fadeImages) {
            if(item.name == typeName)
                return item.GetComponent<Image>();
        }
        return null;
    }
    // FindLoadingImage(type:LoadingType) : GameObject
    // {
    //     const typeName :string = type as string;
    //     for (const item of this.loadingUIs) {
    //         if(item.name == typeName)
    //             return item;
    //     }
    //     return null;
    // }
    FindPopUpImage(type:string) : GameObject
    {
        // const typeName :string = type as string;
        for (let item of this.popUps) {
            if(item.name == type)
                return item;
        }
        return null;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Find GameObject END
}