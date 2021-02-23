/*tracer.js*/

convertHexToIP = (hexArr) => {
	return [...hexArr].map(e => (parseInt(e, 16))); //disgusteng
}

/**/

getLayer2Protocol = () => ('Ethernet');

getLayer3Protocol = (hexArr) => {
	/*IPv4 or IPv6*/
	return `IPv${hexArr[14].split('')[0]}`;	//should always be IPv4
}

getLayer4Protocol = (hexArr) => {
	/*TCP or UDP*/
	switch(hexArr[23]){
		case '01':
			return 'ICMP';
		case '06':
			return 'TCP';
		case '11':
			return 'UDP';
		default:
			return null;
	}
}

getLayer7Protocol = (hexArr) => {
	/*to be interpreted from the ports*/
	
	//NOT GONNA BOTHER WITH THIS ONE LADS
	return null;
}

getTIP = (hexArr) => {
	return convertHexToIP([...hexArr.slice(30, 34)])
}

getSIP = (hexArr) => {
	return convertHexToIP([...hexArr.slice(26, 30)])
}

getSPort = (hexArr) => {
	/*check the diagram*/
	return parseInt([...hexArr].slice(34, 36).join(''), 16);
}

getTPort = (hexArr) => {
	return parseInt([...hexArr].slice(36, 38).join(''), 16);
}

/**/

getServerIP = (SPort, TPort, SIP, TIP) => {
	/*the lower of the two ports*/
	
	return (SPort > TPort) ? TIP : SIP;
}

/**/

hexTraceStringBuilder = (hexArr) => {	
	let stringBuilder = '', segment;
	let i, j, resume;
	
	for(i = 0; i < hexArr.length; i++){
		if(i > 0){
			if(i%16 == 0){
				stringBuilder += '\n';
			} else if(i%8 == 0){
				stringBuilder += '   ';
			}
		}
		stringBuilder += `${hexArr[i]}${((i+1)%8) ? ' ' : ''}`;
	}
	console.log(stringBuilder);
	return stringBuilder;
}

generateHighlightedHexTrace = (hexArr) => {
	let highlighted = [...hexArr];
	let indexedPositions = [
		{name: 'Target MAC', start: 0, end: 6},
		{name: 'Service MAC', start: 6, end: 12},
		{name: 'Internet Protocol', start: 14, nibble: true, which: 0},
		{name: 'TCP/UDP/ICMP', start: 23, end: 24},
		{name: 'Source IP Address', start: 26, end: 30},
		{name: 'Target IP Address', start: 30, end: 34},
		{name: 'Source Port', start: 34, end: 36},
		{name: 'Target Port', start: 36, end: 38}
	];
	
	indexedPositions.map((e) => {
		let { name, start, end, which, nibble } = e;
		nibble = nibble || false;
		
		if(!nibble){
			highlighted[start] = `<span title="${name}" class="inactive highlighted highlight${indexedPositions.indexOf(e)}">${highlighted[start]}`
			highlighted[end-1] = `${highlighted[end-1]}</span>`
		} else {
			let byyte = highlighted[start].split('');
			byyte[0] = which == 0 ? `<span title="${name}" class="inactive highlighted highlight${indexedPositions.indexOf(e)}">${byyte[0]}</span>` : byyte[0];
			byyte[1] = which == 1 ? `<span title="${name}" class="inactive highlighted highlight${indexedPositions.indexOf(e)}">${byyte[1]}</span>` : byyte[1];
			highlighted[start] = byyte.join('');
		}
			
		/**/
		return e;
	});
	
	return `<p>${hexTraceStringBuilder(highlighted)}</p>`;
}

doCalc = () => {
	let hexTrace = document.getElementById("hexTrace").value;
	if(hexTrace !== '' && hexTrace !== null){
		document.getElementById('toggleHighlights').classList.remove('hidden');
		let TMAC, SMAC, TIP, SIP, TPort, SPort, L2, L3, L4, L7, ServerIP;
		let hexArr = hexTrace.replace(/\s/g, 'x').replace(/[\W]/g, '').replace('xxxx', 'x').replace('xxx', 'x').replace('xx', 'x').split('x'); //removes all the whitespace characters and splits into it's bytes
		
		hexArr = hexArr.filter(e => e) //removes null entries and empty strings;
		
		TMAC = [...hexArr.slice(0, 6)];
		SMAC = [...hexArr.slice(6, 12)];
		
		TIP = getTIP(hexArr);
		SIP = getSIP(hexArr);
		
		L2 = getLayer2Protocol();
		L3 = getLayer3Protocol(hexArr);
		L4 = getLayer4Protocol(hexArr);
		
		TPort = getTPort(hexArr);
		SPort = getSPort(hexArr);
		
		ServerIP = getServerIP(SPort, TPort, SIP, TIP);
		
		console.log({
			TMAC: 		TMAC.join(':'),
			SMAC: 		SMAC.join(':'),
			TIP: 		TIP.join('.'),
			SIP:	 	SIP.join('.'),
			Layer2: 	L2,
			Layer3: 	L3,
			Layer4: 	L4,
			SourcePort: SPort,
			TargetPort: TPort,
			ServerIP: 	ServerIP.join('.')
		});
		
		document.getElementById('TMAC').value = TMAC.join(':');
		document.getElementById('SMAC').value = SMAC.join(':');
		document.getElementById('TIP').value = TIP.join('.');
		document.getElementById('SIP').value = SIP.join('.');
		document.getElementById('TPort').value = TPort;
		document.getElementById('SPort').value = SPort;
		document.getElementById('L2').value = L2;
		document.getElementById('L3').value = L3;
		document.getElementById('L4').value = L4;
		
		/*
		[...document.getElementsByClassName('highlighted')].map(el => {
			el.classList.remove('inactive');
		})
		*/
		
		//document.getElementById('Layer7').value = Layer7;
		document.getElementById('ServerIP').value = ServerIP.join('.');
		
		let highlighted = generateHighlightedHexTrace(hexArr);
		document.getElementById('highlighter').innerHTML = highlighted;
		document.getElementById('highlighterContainer').classList.remove('hidden');
	}
	
}

toggleHighlights = () => {
	[...document.getElementsByClassName('highlighted')].map(el => {
			el.classList.toggle('inactive');
		})
}
/*
F8 75 88 14 03 AA F8 98    B9 11 B8 C6 08 00 45 00
00 2C 00 00 00 00 80 06    B0 B2 06 04 17 76 12 25
17 76 06 F7 00 16 26 98    50 6C EF 94 28 97 60 12
10 20 E0 81 00 00 02 04    05 B4 00 00
*/