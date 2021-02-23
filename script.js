getNumHosts = (givenCIDR) => {
  return Math.pow(2, (32 - givenCIDR)) - 2;
}

getNumNetworks = (givenCIDR, defaultCIDR) => {
  return Math.pow(2, (givenCIDR - defaultCIDR));
}

decodeGivenIP = (givenIP) => {
	var actualIP = givenIP.split('/')[0];
	var IPArray = actualIP.split('.');
	var i;
	for (i = 0; i < IPArray.length; i++){
		IPArray[i] = parseInt(IPArray[i]);
	}
	var givenCIDR = parseInt(givenIP.split('/')[1]);
	console.log({givenIP, actualIP, IPArray, givenCIDR});
	
	return {IPArray, givenCIDR}; //decodes properly
}

getWorkingOctet = (givenCIDR) => {
	return Math.floor((givenCIDR - 1) / 8) + 1; //checks out
}

getBitValue = (givenCIDR) => {
	var bitValues = [128, 64, 32, 16, 8, 4, 2, 1];
	
	return bitValues[((givenCIDR - 1) % 8)] //checks out
}

getNetworkClass = (firstOctet) => {
	var NetworkClass = '';
	if(firstOctet >= 0 && firstOctet <= 127) {
		NetworkClass = 'A/8';
	} else if (firstOctet >= 128 && firstOctet <= 191) {
		NetworkClass = 'B/16';
	} else if (firstOctet >= 192 && firstOctet <= 223) {
		NetworkClass = 'C/24';
	} else {
		console.error('network class not found!');
		return null;
	}
	return NetworkClass;
}

getNetworkIP = (WorkingOctet, IPArray, BitValue) => {
	var thresh = IPArray[WorkingOctet-1];
	var NetworkIP = [0, 0, 0, 0];
	var NeXworkIP = [0, 0, 0, 0];
	var mutex = 0;
	while((mutex + BitValue) <= thresh) {
		mutex += BitValue;
	}
	switch(WorkingOctet){
		case 1:
			NetworkIP[0] = (mutex);
			NetworkIP[1] = 0;
			NetworkIP[2] = 0;
			NetworkIP[3] = 0;
			NeXworkIP[0] = (mutex + BitValue);
			NeXworkIP[1] = 0;
			NeXworkIP[2] = 0;
			NeXworkIP[3] = 0;
		break;
		case 2:
			NetworkIP[0] = (IPArray[0]);
			NetworkIP[1] = (mutex);
			NetworkIP[2] = (0);
			NetworkIP[3] = (0);
			NeXworkIP[0] = (IPArray[0]);
			NeXworkIP[1] = (mutex + BitValue);
			NeXworkIP[2] = (0);
			NeXworkIP[3] = (0);
		break;
		case 3:
			NetworkIP[0] = (IPArray[0]);
			NetworkIP[1] = (IPArray[1]);
			NetworkIP[2] = (mutex);
			NetworkIP[3] = (0);
			NeXworkIP[0] = (IPArray[0]);
			NeXworkIP[1] = (IPArray[1]);
			NeXworkIP[2] = (mutex + BitValue);
			NeXworkIP[3] = (0);
		break;
		case 4:
			console.log('case 4');
			NetworkIP[0] = (IPArray[0]);
			NetworkIP[1] = (IPArray[1]);
			NetworkIP[2] = (IPArray[2]);
			NetworkIP[3] = (mutex);
			NeXworkIP[0] = (IPArray[0]);
			NeXworkIP[1] = (IPArray[1]);
			NeXworkIP[2] = (IPArray[2]);
			NeXworkIP[3] = (mutex + BitValue);
		break;
		default:
			return null;
	}
	
	return {NetworkIP, NeXworkIP};
}

getFirstAvailIP = (NetworkIP) => {
	let F = [...NetworkIP];
	if(F[3] +1 >= 256) {
		if(F[2] +1 >= 256) {
			if(F[1] +1 >= 256) {
				if(F[0] +1 >= 256) {
					console.error('Max number of Addresses Reached!');
					return null;
				} else {
					F[0] = F[0] + 1;
					F[1] = 0;
					F[2] = 0;
					F[3] = 0;
				}
			} else {
				F[1] = F[1] + 1;
				F[2] = 0;
				F[3] = 0;
			}
		} else {
			F[2] = F[2] + 1;
			F[3] = 0;
		}
	} else {
		F[3] = F[3] + 1;
	}
	return F;
}

getLastAvailIP = (NeXworkIP) => {
	let L = [...NeXworkIP];
	if(L[3] -1 <= -1) {
		if(L[2] -1 <= -1) {
			if(L[1] -1 <= -1) {
				if(L[0] -1 <= -1) {
					console.error('Min number of Addresses Reached!');
					return null;
				} else {
					L[0] = L[0] - 1;
					L[1] = 255;
					L[2] = 255;
					L[3] = 255;
				}
			} else {
				L[1] = L[1] - 1;
				L[2] = 255;
				L[3] = 255;
			}
		} else {
			L[2] = L[2] - 1;
			L[3] = 255;
		}
	} else {
		L[3] = L[3] - 1;
	}
	return L;
}

getMask = (WorkingOctet, givenCIDR) => {
	var maskValues = [128, 129, 224, 240, 248, 252, 254, 255];
	var mask = [0, 0, 0, 0];
	var i;
	for(i = 0; i < mask.length; i++) {
		if(i < WorkingOctet-1) {
			mask[i] = 255;
		} else if (i == WorkingOctet-1) {
			mask[i] = maskValues[((givenCIDR - 1) % 8)];
		} else {
			mask[i] = 0;
		}
	}
	return mask;
}

doCalc = () => {
	console.log('do calc');
	var NetworkClass, WorkingOctet, BitValue;
	var NetworkIP, F, L, B, NeXworkIP;
	var numHosts, numNets, mask;
	
	decodedIP = decodeGivenIP(document.getElementById('givenIP').value ||'192.168.0.1/24');
	IPArray = decodedIP.IPArray;
	givenCIDR = decodedIP.givenCIDR;
	
	NetworkClass = getNetworkClass(IPArray[0]);
	var defaultCIDR = parseInt(NetworkClass.split('/')[1]);
	WorkingOctet = getWorkingOctet(givenCIDR);
	BitValue = getBitValue(givenCIDR);
	mask = getMask(WorkingOctet, givenCIDR);
	
	var obj = getNetworkIP(WorkingOctet, IPArray, BitValue);
	NetworkIP = obj.NetworkIP;
	F = getFirstAvailIP(NetworkIP);
	
	NeXworkIP = obj.NeXworkIP;
	B = getLastAvailIP(NeXworkIP);
	L = getLastAvailIP(B);
	
	numHosts = getNumHosts(givenCIDR);
	numNets = getNumNetworks(givenCIDR, defaultCIDR);
	
	console.log({
		'GivenIP': `${IPArray.join('.')}/${givenCIDR}`,
		'Class': NetworkClass,
		'Working Octet': WorkingOctet,
		'Bit Value': BitValue,
		'N': `${NetworkIP.join('.')}/${givenCIDR}`,
		'F': F.join('.'),
		'L': L.join('.'),
		'B': B.join('.'),
		'Subnet Mask': mask.join('.'),
		'#Hosts': numHosts,
		'#Nets': numNets
	});
	
	document.getElementById('givenIP').value = `${IPArray.join('.')}/${givenCIDR}`;
	document.getElementById('networkClass').value = NetworkClass;
	document.getElementById('workingOctet').value = WorkingOctet;
	document.getElementById('bitValue').value = BitValue;
	document.getElementById('N').value = `${NetworkIP.join('.')}/${givenCIDR}`;
	document.getElementById('F').value = F.join('.');
	document.getElementById('L').value = L.join('.');
	document.getElementById('B').value = B.join('.');
	document.getElementById('mask').value = mask.join('.');
	document.getElementById('numHosts').value = numHosts;
	document.getElementById('numNets').value = numNets;
	
}

doCheck = () => {
	var NetworkClass, WorkingOctet, BitValue;
	var NetworkIP, F, L, B, NeXworkIP;
	var numHosts, numNets, mask;
	
	decodedIP = decodeGivenIP(document.getElementById('givenIP').value ||'192.168.0.1/24');
	
	/*make a RegEx check to match [0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/[0-9]{1,2} to force a valid ip format */
	
	IPArray = decodedIP.IPArray;
	givenCIDR = decodedIP.givenCIDR;
	
	NetworkClass = getNetworkClass(IPArray[0]);
	var defaultCIDR = parseInt(NetworkClass.split('/')[1]);
	WorkingOctet = getWorkingOctet(givenCIDR);
	BitValue = getBitValue(givenCIDR);
	mask = getMask(WorkingOctet, givenCIDR);
	
	var obj = getNetworkIP(WorkingOctet, IPArray, BitValue);
	NetworkIP = obj.NetworkIP;
	F = getFirstAvailIP(NetworkIP);
	
	NeXworkIP = obj.NeXworkIP;
	B = getLastAvailIP(NeXworkIP);
	L = getLastAvailIP(B);
	
	numHosts = getNumHosts(givenCIDR);
	numNets = getNumNetworks(givenCIDR, defaultCIDR);
	
	// let ActualGivenIP = `${IPArray.join('.')}/${givenCIDR}`;
	
	let ActualNetworkClass = NetworkClass;
	let ActualWorkingOctet = WorkingOctet;
	let ActualBitValue = BitValue;
	let ActualN= `${NetworkIP.join('.')}/${givenCIDR}`;
	let ActualF = F.join('.');
	let ActualL = L.join('.');
	let ActualB = B.join('.');
	let ActualMask = mask.join('.');
	let ActualNumHosts = numHosts;
	let ActualNumNets = numNets;
	
	console.log({
		ActualNetworkClass, 
		ActualWorkingOctet, 
		ActualBitValue, 
		ActualN, 
		ActualF, 
		ActualL, 
		ActualB, 
		ActualMask, 
		ActualNumHosts, 
		ActualNumNets
	});
	
	let UserNetworkClass = document.getElementById('networkClass').value;
	let UserWorkingOctet = document.getElementById('workingOctet').value;
	let UserBitValue = document.getElementById('bitValue').value;
	let UserN = document.getElementById('N').value;
	let UserF = document.getElementById('F').value
	let UserL = document.getElementById('L').value;
	let UserB = document.getElementById('B').value;
	let UserMask = document.getElementById('mask').value;
	let UserNumHosts = document.getElementById('numHosts').value;
	let UserNumNets = document.getElementById('numNets').value;
	
	let NetworkClassFeedback = document.getElementById('networkClassFeedback');
	let WorkingOctetFeedback = document.getElementById('workingOctetFeedback');
	let BitValueFeedback = document.getElementById('bitValueFeedback');
	let NFeedback = document.getElementById('NFeedback');
	let FFeedback = document.getElementById('FFeedback')
	let LFeedback = document.getElementById('LFeedback');
	let BFeedback = document.getElementById('BFeedback');
	let MaskFeedback = document.getElementById('maskFeedback');
	let NumHostsFeedback = document.getElementById('numHostsFeedback');
	let NumNetsFeedback = document.getElementById('numNetsFeedback');
	
	/*
	if(User !== Actual){
		Feedback.innerHTML = `<div><p>That answer is incorrect.</p><p></p></div>`;
	} else {
		Feedback.innerHTML = "";
	}
	*/
	if(UserNetworkClass !== ActualNetworkClass) {
		NetworkClassFeedback.innerHTML = `<div><p>That answer is incorrect. &LT;See page 38 for Network Classes&GT;</p></div>`;
	} else {
		NetworkClassFeedback.innerHTML = "";
	}
	
	if(UserWorkingOctet != ActualWorkingOctet){
		WorkingOctetFeedback.innerHTML = `<div><p>That answer is incorrect.</p><p>To get the Working Octet of the network, use the Given CIDR value and either reference the Table below, or divide the CIDR by 8, rounded, then add one. [(CIDR / 8) + 1]</p></div>`;
	} else {
		WorkingOctetFeedback.innerHTML = "";
	}
	
	if(UserBitValue != ActualBitValue){
		BitValueFeedback.innerHTML = `<div><p>That answer is incorrect.</p><p>Refer to the table below to find the correct Bit Value</p></div>`;
	} else {
		BitValueFeedback.innerHTML = "";
	}
	
	if(UserN !== ActualN){
		if(UserN.indexOf('/') == -1 && UserN.length) {
			NFeedback.innerHTML = `<div><p>That answer is incorrect.</p><p>Did you forget to add the given CIDR?</p></div>`;
		} else {
			NFeedback.innerHTML = `<div><p>That answer is incorrect.</p><p>To get the Network ID, use the following steps:</p><ol><li>Use the Working Octet, Bit Value, and Given IP</li><li>Write down the Given IP address, filling in the octetes <em>before</em> the Working Octet, and set the Working Ocete and all octets afterwards to 0's</li><li>Take the Bit Value and add it to the working octet of the new ip address. Keep adding the Bit Value this way until you cannot add it again without the working octate going over the Given IP.</li></ol><div><hr /><p>Example:</p><p>Given IP: 181.18.81.57/19</p><p>Working Octet: 3</p><p>Bit Value: 32</p><br/><ol><li>Temp IP: <span float="right">181.18.0.0</span></li><li>Add Bit Value to Working Octet: <span>181.18.32.0</span></li><li>Add Bit Value to Working Octet: <span>181.18.64.0</span></li><li>We can't add another Bit Value without going over the Given IP's value in the working octet. (Adding 32 would give us 96, but the give IP's value is 81)</li></ol><p>Process is complete! Network ID is 181.18.64.0/19 (Don't forget to list the CIDR)</p></div></div>`;
		}
	} else {
		NFeedback.innerHTML = "";
	}
	
	if(UserF !== ActualF){
		FFeedback.innerHTML = `<div><p>That answer is incorrect.</p><p>To get the First Available IP address, use the following steps:</p><ol><li>Find the Network IP</li><li>Start the following process from the Last Octet (the 4th octet):</li><li>Add 1 to the octet's value. If that would make the sum 256, set this octet's value to 0 and add 1 to the octet to the left.</li><li>Repeat this process if step 3 occurs in that octet as well.</li></ol></div>`;
	} else {
		FFeedback.innerHTML = "";
	}
	
	if(UserL !== ActualL){
		LFeedback.innerHTML = `<div><p>That answer is incorrect.</p><p>To get the Last Available IP address, use the following steps:</p><ol><li>Find the Broadcast IP</li><li>Start the following process from the Last Octet (the 4th octet):</li><li>Subtract 1 from the octet's value. If that would make the sum -1, set this octet's value to 255 and subtract 1 from the octet to the left.</li><li>Repeat this process if step 3 occurs in that octet as well.</li></ol></div>`;
	} else {
		LFeedback.innerHTML = "";
	}
	
	if(UserB !== ActualB){
		BFeedback.innerHTML = `<div><p>That answer is incorrect.</p><p>To get the Broadcast IP Address, use the following steps: <ol><li>Add the Bit Value to the current Network IP address</li><li>Subtract 1 from the Last Octet.</li><li>If the Last Octet is 0, set it to 255 and subtract 1 from the octet to the left, repeating this step if necessary continuing to the left.</li></ol></p></div>`;
	} else {
		BFeedback.innerHTML = "";
	}
	
	if(UserMask !== ActualMask){
		MaskFeedback.innerHTML = `<div><p>That answer is incorrect.</p><p>To get the Subnet Mask, use the following steps:</p><ol><li>(Start from the leftmost octet.) Are you at the Working Octet? If not, write 255 and move to the next octet.</li><li>Once you reach the Working Octet, refer to the table below to get the correct value.</li></ol></div>`;
	} else {
		MaskFeedback.innerHTML = "";
	}
	
	if(UserNumHosts != ActualNumHosts){
		NumHostsFeedback.innerHTML = `<div><p>That answer is incorrect.</p><p>The formula for the Number of Hosts is as follows:</p><h4>(2<sup>(32 - Given CIDR)</sup>) - 2</h4></div>`;
	} else {
		NumHostsFeedback.innerHTML = "";
	}
	
	if(UserNumNets != ActualNumNets){
		NumNetsFeedback.innerHTML = `<div><p>That answer is incorrect.</p><p>The formula for the Number of Networks is as follows:</p><h4>2<sup>(Given CIDR - Class Default CIDR)</sup></h4></div>`;
	} else {
		NumNetsFeedback.innerHTML = "";
	}
}

// end of file