var client_connected = false;
var client_retry = true;
var client = null;
var mqtt_opt = null;
var connetced_msg = "Connect success";
var useBeep = true;

function tryConnectFirst(){
    if(typeof loadCookie !== 'undefined') loadCookie();
    if(document.location.search.length > 2) type_and_serial = document.location.search.substring(1);
    if(websocket_host != null && websocket_port != null && websocket_username != null && websocket_password != null){
        client_connected = false;
        client = new Paho.MQTT.Client(websocket_host.replace(/^[^\/]*:\/\//,""), Number(websocket_port), "clientId" + new Date().getTime());
        client.onMessageArrived = onMessageArrived;
        client.onConnectionLost = onConnectionLost;
        connetced_msg = type_and_serial;
        mqtt_opt = {
            useSSL: websocket_host.indexOf("wss://") == 0,
            userName: websocket_username,
            password: (websocket_password=="(internal_default)"?"sI7G@DijuY":websocket_password),
            onSuccess: onConnect,
            onFailure: doFail
        };
        client.connect(mqtt_opt);
    }else{
        if(connetced_msg != "Connect success") document.title = "Setting error";
        if(document.getElementById("status") != null) document.getElementById("status").innerHTML = "Setting error";
    }
}

function onConnect() {
    client_connected = true;
    console.log("onConnect");
    if(connetced_msg != "Connect success") document.title = connetced_msg;
    if(document.getElementById("status") != null) document.getElementById("status").innerHTML = connetced_msg;
    onConnected();
}

function doFail() {
    client_connected = false;
    if(client_retry) client.connect(mqtt_opt);
    console.log("doFail");
    if(connetced_msg != "Connect success") document.title = "Connect fail";
    if(document.getElementById("status") != null) document.getElementById("status").innerHTML = "Connect fail";
}

function onConnectionLost(responseObject) {
    client_connected = false;
    if(client_retry) client.connect(mqtt_opt);
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:"+responseObject.errorMessage);
    }
    if(connetced_msg != "Connect success") document.title = "Disconnected";
    if(document.getElementById("status") != null) document.getElementById("status").innerHTML = "Disconnected";
}

function onMessageArrived(message) {
    console.log('payload: ' + message.destinationName + " : " + message.payloadString);
    subscribeParse(message);
}

function beep() {
    if(useBeep) new Audio("data:audio/wav;base64,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").play();
}

function subscribe(topic) {
    if(client_connected){
        client.subscribe(topic);
        console.log("subscribe:" + topic);
    }else{
        console.log("no connect");
    }
}

function unsubscribe(topic) {
    if(client_connected){
        client.unsubscribe(topic);
        console.log("unsubscribe:" + topic);
    }else{
        console.log("no connect");
    }
}

function publish(topic, msg) {
    if(client_connected){
        if(typeof msg !== 'string'){
            msg = JSON.stringify(msg);
        }
        message = new Paho.MQTT.Message(msg);
        message.destinationName = topic;
        client.send(message);
        console.log("publish:" + message);
    }else{
        console.log("no connect");
    }
}

function publishHW(dest) {
    if(typeof type_and_serial !== 'undefined'){
        publish("0/THOUZER_HW/" + type_and_serial + "/exec/cmd", "{\"app\":\"highway\",\"params\":\"--destination " + dest + "\"}");
        beep();
    }
}
function publishCmdParam(cmd, param) {
    if(typeof type_and_serial !== 'undefined'){
        publish("0/THOUZER_HW/" + type_and_serial + "/exec/cmd", "{\"app\":\"" + cmd + "\",\"params\":\"" + param + "\"}");
        beep();
    }
}
function publishCmd(cmd) {
    if(typeof type_and_serial !== 'undefined'){
        publish("0/THOUZER_HW/" + type_and_serial + "/exec/cmd", "{\"app\":\"" + cmd + "\"}");
        beep();
    }
}
function publishVW(v, w) {
    if(typeof type_and_serial !== 'undefined'){
        publish("0/WHISPERER/" + type_and_serial + "/navTest", "{\"v_mps\":\"" + v + "\", \"w_degps\":\"" + w + "\"}");
    }
}
function publishVW_per(v, w) {
    if(typeof type_and_serial !== 'undefined'){
        publish("0/WHISPERER/" + type_and_serial + "/navTest", "{\"v_per\":\"" + v + "\", \"w_per\":\"" + w + "\"}");
    }
}

function subscribeCheckFinishSuccess(from_json) {
    return (from_json.app != null && from_json.app == "#success" && from_json.running != null && from_json.running == "OK");
}
