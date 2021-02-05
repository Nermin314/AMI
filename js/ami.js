
 $(document).ready(function(){
    console.log("DOM is ready");

let socket = io.connect('http://localhost:3000');

let User= class{
    constructor(name,service,ipaddr,date){
    this.name=name;
    this.service=service;
    this.ipaddr=ipaddr;
    this.date=date;
}}

let allUsers = [];
let activeUsers = [];
let activeCalls = [];
let recentEvents = [];
let LIST_ITEM='<div class="item"></div>';

socket.on('event', function (event) {
   
    let ev = event.event;
     switch (ev) {
         case "PeerEntry":     
                    printActivity(event);
                    if(!peerExist(event.accountid)){
                    let html='<i class="user blue icon"></i><div class="content"><a class="header">' + event.objectname + '</a></div></div>';
                    $('#allUsers').append($(LIST_ITEM).val(event.objectname).html(html));
                    allUsers.push(new User(name=event.objectname));
                    }
            break;
            
        case "PeerStatus":
                    printActivity(event);
                    let peer=event.peer.match(/[a-z][a-z0-9]+/)[0];
                    //Delete from Active user list if peer is no more active
                    if(event.peerstatus=="Unregistered" && peerExist(peer)){
                        activeUsers = activeUsers.filter(el=>el.name!==peer);
                        let deletePeer=document.getElementById("#"+peer);
                        deletePeer.parentElement.remove();
                    }
                    //Push active user and print this activity
                    else if((event.peerstatus=="Registered"||event.peer.peerStatus=="Reachable")&&!peerExist(peer)){   
                        activeUsers.push(new User(peer,"","",""));
                        console.log("Peer StaTUS REGISTRED");
                    }
                
            break;

        case "DeviceStateChange":
        case "ChallengeSent":
        case "Newexten":
        case "SoftHangupRequest":
                    printActivity(event);
            break;

        case "SuccessfulAuth":
                    printActivity(event);
                    let reg=/\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}\/\d{4}/;
                    let ip=event.localaddress.match(reg)[0];
                    let peerName=event.accountid;
                    let service=event.service;
                    let date=event.eventtv.match(/\d{4}-\d{2}-\d{2}/);
                    let time=event.eventtv.match(/\d{2}:\d{2}:\d{2}/);
                    let dateTime=date+ ' '+ time;
                    let peerActive=new User(peerName,service,ip,dateTime);
                    console.log("SUCCESAUTH");
                    console.log(peerActive);
                    if(peerExist(event.accountid)){
                        //Find and update active user for more information
                        activeUsers=activeUsers.filter(e=>e.name!=peerName);
                        activeUsers.push(peerActive);
                        let isAdded=document.getElementById("#"+peerName);
                        if(!isAdded){
                        let html='<i id=#'+peerName+' class="user blue icon"></i><div class="content"><a class="header">' + peerName + 'Time connected: ' + dateTime + ' Ipaddr: '+ ip +'</a></div></div>';
                        $('#activeUsers').append($(LIST_ITEM).val(peerName).html(html));
                    }}

            break;
                   
        case "Hangup":
                    if(callExist(event.exten)){  
                    let deleteCall=document.getElementById("#"+event.exten);
                    deleteCall.parentElement.remove();
                      }    
            break;

        case "DialEnd":
                    if(event.dialstatus==="ANSWER"){
                    let callerPeer=event.channel.match(/[a-z][a-z0-9]+/)[0];
                    let destCalled=event.destcalleridnum;
                    let destChannel=event.destchannel;
                    let timestamp=event.timestamp;
                    let time=getTime(timestamp);
                    let isAdded=document.getElementById("#"+destCalled);
                    activeCalls.push(new User(destCalled,"","",""));
                    if(!isAdded){
                        let html='<i id=#'+destCalled+' class="user blue icon"></i><div class="content"><a class="header">' + callerPeer +' CALLED: ' + destCalled + 'CHANN CALLED: '+destChannel +' TIME: '+time+'</a></div></div>';
                        $('#activeCalls').append($(LIST_ITEM).val(callerPeer).html(html));
                        }}    
            break;  

         default:
            break;

    // }
            }

});

function getTime(timestamp){

    let date = new Date(timestamp * 1000);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
}


function printActivity(event){
    let html='<i class="clipboard blue icon"></i><div class="content"><a class="header">' +JSON.stringify(event)+ '</a></div></div>';
    $('#recetntActivities').append($(LIST_ITEM).val(event).html(html));
}

function peerExist(peer){
    let check=activeUsers.some(e=>e.name===peer);
    return check;

}
function callExist(calledID){
    let check=activeCalls.some(e=>e.name===calledID);
    return check;

}

socket.on('respond', function (data) {
  console.log(data);
});
});

