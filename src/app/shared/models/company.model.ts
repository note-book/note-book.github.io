export class Company {
  constructor(
    public name: string,
    public date?: firebase.default.firestore.Timestamp,
    public id?: string,
    public tabs?: Tabs[]
  ){}
}

export class Tabs {
  constructor(
    public tabName: string,
    public tabOrder: number,
    public tabDescription?: any,
    public id?: string
  ){}
}