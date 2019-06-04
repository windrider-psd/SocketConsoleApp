let readline = require('readline')
let net = require('net')
let chalk = require('chalk')

let interface = readline.createInterface({
    input : process.stdin,
    output : process.stdout,
    terminal : true
})

let _ip;
let _port;

function Init()
{
    
    AskIp((ip) => {
        AskPort(port => {
            _ip = ip;
            _port = port;
            let socket = new net.Socket()
            SetSocketCallbacks(socket);
            SetUpInterfaceCallbacks(socket);
            socket.connect(port, ip)
        })
    })
}

/**
 * 
 * @param {net.Socket} socket 
 */
function SetSocketCallbacks(socket)
{
    console.log(chalk.blue("Connecting..."))
    socket.on('connect', () => {
        console.log(chalk.green("Socket connected"))
    })

    socket.on('data', (buffer) => {
        let data = String(buffer);
        console.log(`Socket has received: ${chalk.green(data)}`)
    })

    
}
/**
 * 
 * @param {net.Socket} socket 
 */
function SetUpInterfaceCallbacks(socket)
{
    //
    socket.on('connect', () => {
        interface.resume();
        console.log(chalk.blue("Type a message to send: "))
        interface.on('line', (line) => {
            line = line.trim();
            socket.write(line);
        })
    })

    socket.on('end', () => {
        console.log(`${chalk.red("Connection ended")}`)
        //interface.close();
        AskReconnection(socket);
    })

    socket.on('error', (err) => {
        console.log(`${chalk.red("Connection error")}`)
        console.error(err.message);
        //interface.close();
        AskReconnection(socket);
    })

    socket.on('timeout', () =>{
        console.log(`${chalk.red("Connection timeout")}`)
        //interface.close();
        AskReconnection(socket);
    })
}


/**
 * 
 * @param {net.Socket} socket 
 */
function AskReconnection(socket)
{
    interface.question("Try reconnection? (y)", (reconnect) => {
        reconnect = reconnect.trim().toLowerCase();

        if(reconnect == "" || reconnect == "yes" || reconnect == "y")
        {
            socket.connect(_port, _ip);
        }
    })
}


function AskIp(callback)
{
    interface.question("Connection IP address (machine's IP by default): ", (ip) => {
        ip = ip.trim();
        if(ip == "")
        {
            ip = require('ip').address();
            callback(ip)
        }
        else if(ValidateIPaddress(ip))
        {
            callback(ip);
        }
        else
        {
            interface.write(chalk.red("Invalid IP address.\n"))
            AskIp(callback);
        }
    })
}

function AskPort(callback)
{
    interface.question("Connection port: ", (port) => {
        port = port.trim();
        
        if(port == "" || isNaN(port))
        {
            interface.write(chalk.red("Invalid port.\n"))
            AskPort(callback);
        }
        else
        {
            callback(port)
        }

    })
}

function ValidateIPaddress(ipaddress) 
{  
    return (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress))
}

Init();