import { GameObject, Object, Quaternion, Resources, Transform, Vector3 } from 'UnityEngine'

export default class ResourceManager {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton
    private constructor () {  }
    private static _instance : ResourceManager;
    public static get instance(): ResourceManager
    {
        if(this._instance == null)
            this._instance = new ResourceManager();
        return this._instance;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton END
    
    private instancePool: Map<string, GameObject[]> = new Map<string, GameObject[]>();
    public Load<T extends Object>(path:string) :T{
        return Resources.Load<T>(path);
    }

    public Instantiate(path:string, parent:Transform = null):GameObject{
        let prefab = this.Load<GameObject>(`Prefabs/${path}`);

        if(prefab == null){
            console.error(`Failed to load prefab ${path}`);
            return null;
        }
        if(parent == null)
            return Object.Instantiate(prefab) as GameObject;

        return Object.Instantiate(prefab, parent) as GameObject;
    }

    public Destroy(go:GameObject){
        if(go == null)
            return null;

        go.transform.SetParent(null);
        Object.Destroy(go);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// Instace Pool

    private MakeGameObjectInPool(path:string)
    {
        let prefab = this.Load<GameObject>(`Prefabs/${path}`);                      // prefab Load

        if(!this.instancePool.has(path))                                            // pool이 없다면 생성
        {
            let arr = new Array<GameObject>();
            const poolSize = 4;
            for(let i=0; i<poolSize; i++)
            {
                let instant = Object.Instantiate(prefab, new Vector3(0, -20, 0), Quaternion.identity) as GameObject;
                instant.SetActive(false);
                arr.push( instant );
            }
            this.instancePool.set(path, arr);
        }
    }
    public GetGameObjectInPool(path:string, parent:Transform = null) : GameObject
    {
        this.MakeGameObjectInPool(path);

        if(this.instancePool.get(path) == null || this.instancePool.get(path)[0] == null)            // 최종 체크
        {
            console.log(`Failed to load prefab ${path}`);
            return null;
        }

        const go = this.instancePool.get(path)[0];                                                   // pool에서 제거 후 Return
        go.transform.SetParent(parent);
        this.instancePool.get(path).splice(0, 1);
        this.instancePool.get(path).push(go);                                                        // pool에 재등록
        go.SetActive(true);
        return go;
    }

    public ReturnGameObjectInPool(path:string, go:GameObject)
    {
        if(!this.instancePool.has(path))
        {
            console.error(`이 게임오브젝트는 Pool이 없다`);
            return;
        }

        go.transform.SetParent(null);
        go.transform.position = new Vector3(0, -20, 0);
        go.SetActive(false);
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// Instace Pool END
}