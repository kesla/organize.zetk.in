require('array.prototype.find');

Date.prototype.getWeekNumber = function(){
    var d = new Date(+this);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};

Array.prototype.equals = function(other) {
    if (!other)
        return false;

    if (other == this)
        return true;

    if (this.length != other.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        if (this[i] != other[i]) {
            return false;
        }
    }

    return true;
};
