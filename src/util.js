const rem_emp = function (e) {return e !== "";}

module.exports = { 
  diff(a,b){
    return (a>b)?(a-b):(b-a);
  },
  upload_limit(guild){
    //https://stackoverflow.com/questions/66396146/get-channels-filesize-limit
    switch (guild.premiumTier) {
      case 'TIER_3': return 100
      case 'TIER_2': return 50
      default: return 8
    }
  },
  limit_exp(exp,length){
    exp = exp.split('e')
    for(let i = 0; i!=length; i++)
      exp[0]+="0"
    exp[0] = exp[0].substring(0,length+2)
    return exp.join('e')
  },
  rem_emp,
  parse_inp(str){
    let open = false;
    let out = []
    let cur = ""
    for(let c of str){
      if(c=='"'){
        if(open){
          out.push(cur)
          cur=""
        }
        open=!open;
      }
      else {
        if(!open){
          if(c==' '){
            out.push(cur)
            cur=""
          } else {
            cur+=c
          }
        } else {
          cur+=c
        }
          
      }
    }
    out.push(cur)
    return out.filter(rem_emp)
  },
  similarity(s1, s2) {
    //https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
    function editDistance(s1, s2) {
      s1 = s1.toLowerCase();
      s2 = s2.toLowerCase();
    
      var costs = new Array();
      for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
          if (i == 0)
            costs[j] = j;
          else {
            if (j > 0) {
              var newValue = costs[j - 1];
              if (s1.charAt(i - 1) != s2.charAt(j - 1))
                newValue = Math.min(Math.min(newValue, lastValue),
                  costs[j]) + 1;
              costs[j - 1] = lastValue;
              lastValue = newValue;
            }
          }
        }
        if (i > 0)
          costs[s2.length] = lastValue;
      }
      return costs[s2.length];
    }
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
  },

  deepCopy(src) {
    //https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript/49497485
    let target = Array.isArray(src) ? [] : {};
    for (let prop in src) {
      let value = src[prop];
      if(value && typeof value === 'object') {
        target[prop] = deepCopy(value);
    } else {
        target[prop] = value;
    }
   }
      return target;
  }
  
}