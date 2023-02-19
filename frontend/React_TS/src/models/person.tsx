export default class Persons {
    Id?: string;
    Name: string;
    Address: string;
    Image: object;

    constructor(id: string,fullanme: string, address: string, image: object) {
        this.Id = id;
        this.Name = fullanme;
        this.Address = address;
        this.Image = image;
    } 
}