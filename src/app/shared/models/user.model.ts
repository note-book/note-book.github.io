export class User{
  constructor(
    public email: string, 
    public id: string, 
    private _tokenId: string, 
    private _tokenExpTime: Date
  ){}

  get token(){
    if (!this._tokenExpTime || new Date() > this._tokenExpTime){
      return null;
    } else{
      return this._tokenId
    }
  }
}

export class UserAdditionalInfo {
  constructor(
    public name: string,
    public phoneCode: number,
    public phone: number,
    public email: string,
    public userImg: string,
    public id?: string
  ){}
}