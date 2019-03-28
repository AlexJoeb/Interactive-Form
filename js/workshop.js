class Workshop {
  constructor(name, timeFrom, timeTo, day, price, element){
    this._name = name;
    this._timeFrom = timeFrom;
    this._timeTo = timeTo;
    this._element = element;
    this._day = day;
    this._price = price;
    this._timeArray = this.timeArray(this._timeFrom, this._timeTo);
  }

  get name(){
    return this._name;
  }

  set name(name){
    this._name = name;
  }

  get timeFrom(){
    return this._timeFrom;
  }

  set timeFrom(timeFrom){
    this._timeFrom = timeFrom;
  }

  get timeTo(){
    return this._timeTo;
  }

  set timeTo(timeTo){
    this._timeTo = timeTo;
  }

  get day(){
    return this._day;
  }

  set day(day){
    this._day = day;
  }

  get element(){
    return this._element;
  }

  set element(element){
    this._element = element;
  }

  // Returns [9, 10, 11, 12] -- For the hours this workshop takes.
  timeArray(){
    let arr = [];
    for(let i = this._timeFrom; i <= this._timeTo; i++){
      arr.push(i);
    }
    return arr;
  }

  conflicts(otherTimeArray, otherDay){
    if(otherDay == this._day){
      for(let x in this._timeArray){
        if(otherTimeArray.includes(this._timeArray[x])){
          return true;
        }else continue;
      }
      return false;
    }else{
      return false;
    }
  }
}