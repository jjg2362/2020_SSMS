const agent = navigator.userAgent.toLowerCase();
if ( (navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1)) {
    // ie일 경우
    alert( `Chrome Browser를 이용하여야 모든 기능을 원할히 이용가능합니다.\nInternet Explorer를 이용하는 경우 모든 기능을 사용하실 수 없을 수 있습니다.` );
}