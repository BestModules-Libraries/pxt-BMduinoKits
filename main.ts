// WiFi 模組初始化模式
enum WiFiMode {
    //% block="STA 模式"
    STA = 1,
    //% block="AP 模式"
    AP = 2,
    //% block="AP+STA 模式"
    AP_STA = 3
}
enum UARTChannel {
    //% block="UART1"
    UART1 = 1,
    //% block="UART2"
    UART2 = 2,
    //% block="UART3"
    UART3 = 3
}
enum GasConcentrationRange {
    //% block="5000ppm"
    Range5000 = 5000,
    //% block="2000ppm"
    Range2000 = 2000
}
enum TDSChannel {
    //% block="通道1"
    Channel1 = 1,
    //% block="通道2"
    Channel2 = 2
}
declare interface Math {
    floor(x: number): number;
}
//% color=#0fbcf9 icon="\uf015" 
namespace 智慧家居 {
    /**
    * WiFi 模組積木
    */
    let isInitialized = false;
    /**
      * 讀取模組的回應
      * @returns 回應字串
      */
    export function readResponse(): string {
        let response = "";
        let startTime = input.runningTime();
        let hasData = false;

        while (input.runningTime() - startTime < 4000) {
            let data = serial.readString();
            if (data && data.length > 0 && data.length < 22) {
                //basic.showString(data);
                response += data;
                hasData = true;
                basic.pause(10);
            }
        }

        if (!hasData) {
            basic.showString("NO RESP");
        }

        return response.trim(); // 去除多餘的空格或換行符，返回回應
    }


    /**
    * WiFi 熱點
    * @param ssid WiFi 名稱, eg: "my_wifi"
    * @param password WiFi 密碼, eg: "12345678"
     */
    //% block="WiFi 熱點 SSID %ssid 密碼 %password"
    export function connectToWiFi(ssid: string, password: string): void {
        if (!isInitialized) {
            let command = "AT\r\n";
            let command1 = `AT+WMODE=3,0\r\n`;
            let command2 = `AT+WJAP=${ssid},${password}\r\n`;

            serial.redirect(SerialPin.P0, SerialPin.P1, 115200); // 使用 P0 和 P1 作為 UART

            //智慧家居.writeStringNewLine("Open your HOTSPOT!");

            let response = "";
            serial.writeString(command);
            basic.pause(100);
            response = readResponse();
            if (response.includes("OK")) {
                let response1 = "";
                serial.writeString(command1);
                basic.pause(500);
                response1 = readResponse();
                if (response1.includes("OK")) {
                    let response2 = "";

                    while (true) {
                        serial.writeString(command2);
                        basic.pause(500);
                        response2 = readResponse();

                        if (response2.includes("OK")) {
                            //智慧家居.clear()
                            //智慧家居.writeStringNewLine("WiFi Connected!")
                            //智慧家居.writeStringNewLine("SSID: " + ssid)
                            basic.pause(500)
                            isInitialized = true
                            break
                        } else {
                            //智慧家居.clear()
                            //智慧家居.writeStringNewLine("Connecting WiFi...")
                        }
                    }

                } else {
                    //智慧家居.writeStringNewLine("WiFi Mode Set ERROR");
                }
            }
        } else {
            basic.showString("ERROR"); // 顯示錯誤
        }
    }



    /**
  * 發送 MQTT 請求
  */
    //% block="ThingSpeak |  Client ID %client| Username %name| Password %password|"
    export function sendMQTT(client: string, name: string, password: string): void {
        if (isInitialized) {

            //智慧家居.clear()
            //智慧家居.writeStringNewLine("Waiting for upload...");

            let command1 = `AT+MQTT=1,"mqtt3.thingspeak.com"\r\n`;
            let command2 = `AT+MQTT=2,"1883"\r\n`;
            let command3 = `AT+MQTT=3,1\r\n`;
            let command4 = `AT+MQTT=4,"${client}"\r\n`;
            let command5 = `AT+MQTT=5,"${name}"\r\n`;
            let command6 = `AT+MQTT=6,"${password}"\r\n`;
            let command7 = `AT+MQTT\r\n`;
            let command8 = `AT+MQTT?\r\n`;


            let response = ""
            serial.writeString(command1);
            basic.pause(100);
            response = readResponse(); // 讀取回應
            basic.pause(500);

            let response1 = ""
            serial.writeString(command2);
            basic.pause(500);
            response1 = readResponse();
            //智慧家居.clear();

            serial.writeString(command3);
            basic.pause(500);
            //智慧家居.clear();

            serial.writeString(command4);
            basic.pause(500);
            //智慧家居.clear();

            serial.writeString(command5);
            basic.pause(500);
            //智慧家居.clear();

            serial.writeString(command6);
            basic.pause(500);
            //智慧家居.clear();

            serial.writeString(command7);
            basic.pause(500);
            //智慧家居.clear();

            serial.writeString(command8);
            basic.pause(500);
            //智慧家居.clear();

        } else {
            //智慧家居.writeStringNewLine("ERROR: Module not initialized!");
        }
    }


    /**
    * 發送 MQTT 請求
     */
    //% expandableArgumentMode="enabled"
    //% block="PUBLISHTOPIC 發布訊息 | Channel ID %topic| field1_data %data||field2_data %data1| field3_data %data2| field4_data %data3| field5_data %data4| field6_data %data5| field7_data %data6| field8_data %data7"
    //% topic.defl=0 data.defl=0 data1.defl=0 data2.defl=0 data3.defl=0 data4.defl=0 data5.defl=0 data6.defl=0 data.defl=0
    export function PUBLISHTOPIC(topic: number = 0, data: number = 0, data1: number = 0, data2: number = 0, data3: number = 0, data4: number = 0, data5: number = 0, data6: number = 0, data7: number = 0): void {
        let response = "";
        let topic1 = "channels" + "/" + topic + "/" + "publish";
        let data_buf1 = "field1=" + data;
        let data_buf2 = "field2=" + data1;
        let data_buf3 = "field3=" + data2;
        let data_buf4 = "field4=" + data3;
        let data_buf5 = "field5=" + data4;
        let data_buf6 = "field6=" + data5;
        let data_buf7 = "field7=" + data6;
        let data_buf8 = "field8=" + data7;

        let command = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf1 + "\r\n";
        let command1 = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf2 + "\r\n";
        let command2 = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf3 + "\r\n";
        let command3 = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf4 + "\r\n";
        let command4 = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf5 + "\r\n";
        let command5 = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf6 + "\r\n";
        let command6 = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf7 + "\r\n";
        let command7 = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf8 + "\r\n";

        for (let i = 0; i < 8; i++) {
            let retryCount = 0;
            let success = false;
            let currentCommand = "";

            switch (i) {
                case 0:
                    currentCommand = command;
                    break;
                case 1:
                    currentCommand = command1;
                    break;
                case 2:
                    currentCommand = command2;
                    break;
                case 3:
                    currentCommand = command3;
                    break;
                case 4:
                    currentCommand = command4;
                    break;
                case 5:
                    currentCommand = command5;
                    break;
                case 6:
                    currentCommand = command6;
                    break;
                case 7:
                    currentCommand = command7;
                    break;
            }

            while (retryCount <= 2 && !success) {
                serial.writeString(currentCommand);
                basic.pause(500);
                response = readResponse();

                if (response.includes("ERROR")) {
                    retryCount++;
                    if (retryCount <= 2) {
                        basic.pause(500);
                    }
                } else {
                    success = true;
                    basic.pause(500);
                }
            }
        }
    
    }





/**
* 接收 MQTT
*/
    //% block="SUBSCRIBE 訂閱 | Channel ID = %host|"
/*export function SUBSCRIBE(topic: number = 0): void {
    if (isInitialized) {
        // 拼接 AT 指令
        let topic1 = "channels" + "/" + topic + "/" + "subscribe" + "/" + "fields" + "/" + "field1";
        let command = "AT+MQTTSUB=" + topic1 + ",1" + "\r\n";
        serial.writeString(command);
        basic.pause(1000);
        let response = ""
        response = readResponse(); // 讀取回應
        智慧家居.writeStringNewLine(response);
    } else {
        basic.showString("ERROR"); // 顯示錯誤
    }
}*/





    //---------------------------------------------------------------
    // 數位型溫溼度感測模組 (BM25S2021)
    //---------------------------------------------------------------
    let tmp_dataBuff: number[] = []; // 暫存資料

    export enum tmp_TemperatureUnit {
        //% block="華氏"
        Fahrenheit,
        //% block="攝氏"
        Celsius
    }

    class tmp_BM25S2021_1 {
        // 初始化函數
        begin(): void {
            // MakeCode 預設會處理 I2C 初始化，無需額外設定
        }

        // 讀取溫度
        //% block="讀取溫度 (單位：%unit)" subcategory="數位型溫濕度感測模組" color=#0fbcf9 weight=80
        readTemperature(unit: tmp_TemperatureUnit): number {
            let tmp_temperature = 0;
            let tmp_sendbuf: number[] = [0x03, 0x02, 0x02]; // 讀取溫度命令

            // 寄送命令並讀取資料
            this.writeBytes(tmp_sendbuf, 0x5C); // 感測器地址為 0x5C
            basic.pause(2); // 等待感測器響應

            if (this.readBytes(0x5C, 4) === 0) {
                // 合併高低位數據
                tmp_temperature = (tmp_dataBuff[2] << 8) | tmp_dataBuff[3];
                if (unit === tmp_TemperatureUnit.Fahrenheit) {
                    // 華氏溫度轉換
                    tmp_temperature = tmp_temperature * 0.18 + 32;
                } else {
                    // 攝氏溫度處理
                    tmp_temperature = tmp_temperature / 10;
                }
            }
            return tmp_temperature;
        }

        // 讀取溼度
        //% block="讀取溼度" subcategory="數位型溫濕度感測模組" color=#0fbcf9 weight=90
        readHumidity(): number {
            let tmp_humidity = 0;
            let tmp_sendbuf: number[] = [0x03, 0x02, 0x01]; // 讀取溼度命令

            this.writeBytes(tmp_sendbuf, 0x5C);
            basic.pause(2);

            if (this.readBytes(0x5C, 4) === 0) {
                tmp_humidity = (tmp_dataBuff[2] << 8) | tmp_dataBuff[3];
                tmp_humidity = tmp_humidity / 10;
            }
            return tmp_humidity;
        }

        // 寄送 I2C 資料
        private writeBytes(tmp_sendbuf: number[], addr: number): void {
            let buffer = pins.createBuffer(tmp_sendbuf.length);
            for (let i = 0; i < tmp_sendbuf.length; i++) {
                buffer.setNumber(NumberFormat.UInt8LE, i, tmp_sendbuf[i]);
            }
            pins.i2cWriteBuffer(addr, buffer);
        }

        // 讀取 I2C 資料
        private readBytes(addr: number, length: number): number {
            try {
                let buffer = pins.i2cReadBuffer(addr, length);
                for (let i = 0; i < length; i++) {
                    tmp_dataBuff[i] = buffer.getNumber(NumberFormat.UInt8LE, i);
                }
                return 0; // 成功讀取
            } catch {
                return -1; // 讀取失敗
            }
        }
    }

    let tmp_bm25: tmp_BM25S2021_1;

    // I2C 初始化設定
    //% block="初始化溫濕度感測器"
    //% subcategory="數位型溫濕度感測模組" color=#0fbcf9 weight=255
    export function tmp_initializeBM25S2021IIC(): void {
        tmp_bm25 = new tmp_BM25S2021_1();
        tmp_bm25.begin();
    }

    // 讀取溫度（傳回華氏或攝氏）
    //% block="讀取溫度 (單位：%unit)" subcategory="數位型溫濕度感測模組" color=#0fbcf9
    export function tmp_readTemperature(unit: tmp_TemperatureUnit): number {
        return tmp_bm25.readTemperature(unit);
    }

    // 讀取溼度
    //% block="讀取溼度" subcategory="數位型溫濕度感測模組" color=#0fbcf9
    export function tmp_readHumidity(): number {
        return tmp_bm25.readHumidity();
    }



    //---------------------------------------------------------------
    // PM2.5 感測模組 (BM25S3221)
    //---------------------------------------------------------------
    let _initialized = false
    let _txPin = SerialPin.P0
    let _rxPin = SerialPin.P1
    let _pwmPin = AnalogPin.P2
    let _pm25_pwm_lastReading = 0
    let _pm25_uart_lastReading = 0

    /**
     * 初始化 BM25S3221 感測器，選擇 UART 通道與 PWM 接腳
     */
    //% blockId="BM25S3221_begin_uart" 
    //% block="初始化 PM2.5 感測器 通道 %uart| PWM 接腳 %pwm"
    //% subcategory="PM2.5感測模組"
    //% weight=255
    export function PM_begin(uart: UARTChannel, pwm: AnalogPin): void {
        _pwmPin = pwm

        if (uart == UARTChannel.UART1) {
            _rxPin = SerialPin.P1
            _txPin = SerialPin.P0
        } else if (uart == UARTChannel.UART2) {
            _rxPin = SerialPin.P12
            _txPin = SerialPin.P13
        } else if (uart == UARTChannel.UART3) {
            _rxPin = SerialPin.P15
            _txPin = SerialPin.P16
        }

        serial.redirect(_txPin, _rxPin, BaudRate.BaudRate9600)
        basic.pause(2000)
        serial.readString()
        _initialized = true
    }

    //% blockId="BM25S3221_readPM25_pwm" 
    //% block="透過PWM讀取PM2.5濃度"
    //% subcategory="PM2.5感測模組"
    //% weight=90
    export function readPM25byPWM(): number {
        let th = pins.pulseIn(_pwmPin, PulseValue.High, 2000000)
        if (th < 200) return _pm25_pwm_lastReading

        let pm25Val = Math.floor(th / 1000)
        _pm25_pwm_lastReading = pm25Val
        return pm25Val
    }



    //---------------------------------------------------------------
    // 煙霧感測模組
    //---------------------------------------------------------------
 
   
    //% block="初始化煙霧感測器模組，選擇 UART 通道 %uart"
    //% subcategory="煙霧感測模組" color=#0fbcf9 weight=255


    export function smoke_initialize(uart: UARTChannel): void {
        let _txPin = SerialPin.P0
        let _rxPin = SerialPin.P1
        if (uart == UARTChannel.UART1) {
            _rxPin = SerialPin.P1
            _txPin = SerialPin.P0
        } else if (uart == UARTChannel.UART2) {
            _rxPin = SerialPin.P12
            _txPin = SerialPin.P13
        } else if (uart == UARTChannel.UART3) {
            _rxPin = SerialPin.P16
            _txPin = SerialPin.P15
        }

        serial.redirect(_txPin, _rxPin, BaudRate.BaudRate9600);
        basic.pause(100);
    }

    //% block="讀取通道煙霧數值" subcategory="煙霧感測模組" color=#0fbcf9
    export function smoke_readSmokeValue(): number {
        basic.pause(50);
        let smoke_response = serial.readBuffer(41);

        if (smoke_response.length >= 20) {
            // T0A 在封包 offset = 16,17 (Little Endian)
            return smoke_response.getNumber(NumberFormat.UInt16LE, 16);
        }
        return -1;
    }

    //% block="檢查 STATUS 狀態" subcategory="煙霧感測模組" color=#0fbcf9
    export function smoke_checkStatus(): boolean {
        basic.pause(50);
        let smoke_response = serial.readBuffer(12);
        return smoke_response.length >= 5 && smoke_response[4] == 0xAD;
    }

    //% block="執行感測器校準" subcategory="煙霧感測模組" color=#0fbcf9
    export function smoke_calibrate(): boolean {
        basic.pause(8000);
        let smoke_response = serial.readBuffer(8);
        return smoke_response.length >= 7 && smoke_response[6] == 0xA0;
    }

    //% block="重置感測器" subcategory="煙霧感測模組" color=#0fbcf9
    export function smoke_reset(): boolean {
        basic.pause(50);
        let smoke_response = serial.readBuffer(8);
        return smoke_response.length >= 5 && smoke_response[4] == 0xAF;
    }



    //----------------------------------------------------------
    // CO2感測器
    //---------------------------------------------------------- 
    const HEADER_BYTE = 0xFF;
    const DEVICE_ADDRESS = 0x01;
    const CMD_READ_GAS = 0x86;
    const CMD_SET_CONCENTRATION_RANGE = 0x99;
    const CMD_ZERO_CALIBRATE = 0x87;
    const SERIAL_BAUDRATE = 9600;

    let CO2_isInitialized = false;
    let maxConcentrationRange = 5000; // 預設量程為 400-5000ppm
    /**
     * 初始化 CO2 感測器
     * @param rxPin 接收腳位, eg: SerialPin.P0
     * @param txPin 發送腳位, eg: SerialPin.P1
     * @param range 測量範圍, eg: GasConcentrationRange.Range5000
     */
    //% block="初始化 CO2 感測器 通道 $uartChannel 範圍 $range" subcategory="CO2感測器"
    //% weight=100
    export function initialize(uartChannel: UARTChannel, range: GasConcentrationRange = GasConcentrationRange.Range5000): void {
        let rxPin: SerialPin;
        let txPin: SerialPin;

        // 根據選擇的 UART 通道設置對應的 RX 和 TX 腳位
        if (uartChannel == UARTChannel.UART1) {
            rxPin = SerialPin.P1; // UART1 RX
            txPin = SerialPin.P0; // UART1 TX
        } else if (uartChannel == UARTChannel.UART2) {
            rxPin = SerialPin.P13; // UART2 RX
            txPin = SerialPin.P12; // UART2 TX
        } else if (uartChannel == UARTChannel.UART3) {
            rxPin = SerialPin.P16; // UART3 RX
            txPin = SerialPin.P15; // UART3 TX
        }

        // 設定串口
        serial.redirect(txPin, rxPin, SERIAL_BAUDRATE);
        serial.setRxBufferSize(64);
        serial.setTxBufferSize(64);

        // 清空緩衝區
        serial.readString();

        // 設置最大量程
        maxConcentrationRange = range;
        setConcentrationRange(maxConcentrationRange);

        // 等待模組初始化
        basic.pause(1000);

        isInitialized = true;
        basic.showIcon(IconNames.Yes);
    }
    /**
     * 預熱 CO2 感測器 (60秒)
     */
    //% block="預熱 CO2 感測器" subcategory="CO2感測器"
    //% weight=90
    export function warmUp(): void {
        if (!isInitialized) {
            basic.showIcon(IconNames.No);
            return;
        }

        basic.showString("wait");
        for (let i = 8; i > 0; i--) {
            basic.pause(1000);
        }
        basic.showIcon(IconNames.Yes);
    }
    /**
     * 讀取 CO2 濃度值
     */
    //% block="讀取 CO2 濃度 (ppm)" subcategory="CO2感測器"
    //% weight=80
    export function getGasConcentration(): number {
        if (!isInitialized) {
            basic.showIcon(IconNames.No);
            return 0;
        }

        // 清空接收緩衝區
        serial.readString();

        // 構建命令
        let cmdBuffer = pins.createBuffer(9);
        cmdBuffer[0] = HEADER_BYTE;
        cmdBuffer[1] = DEVICE_ADDRESS;
        cmdBuffer[2] = CMD_READ_GAS;
        cmdBuffer[3] = 0x00;
        cmdBuffer[4] = 0x00;
        cmdBuffer[5] = 0x00;
        cmdBuffer[6] = 0x00;
        cmdBuffer[7] = 0x00;
        cmdBuffer[8] = CO2_calculateChecksum(cmdBuffer);

        // 發送命令
        serial.writeBuffer(cmdBuffer);

        // 等待回應
        basic.pause(100);

        // 讀取回應
        let responseBuffer = serial.readBuffer(9);

        // 檢查回應有效性
        if (responseBuffer.length < 9 || responseBuffer[0] != HEADER_BYTE || responseBuffer[1] != CMD_READ_GAS) {
            return -1; // 無效回應
        }

        // 解析 CO2 濃度值
        let gasConcentration = (responseBuffer[2] << 8) | responseBuffer[3];
        return gasConcentration;
    }
    /**
     * 校準零點 (400ppm)
     * 注意: 需要在乾淨的空氣環境中進行
     */
    //% block="校準零點 (400ppm)" subcategory="CO2感測器"
    //% weight=70
    export function calibrateToZero(): void {
        if (!isInitialized) {
            basic.showIcon(IconNames.No);
            return;
        }

        // 構建命令
        let cmdBuffer = pins.createBuffer(9);
        cmdBuffer[0] = HEADER_BYTE;
        cmdBuffer[1] = DEVICE_ADDRESS;
        cmdBuffer[2] = CMD_ZERO_CALIBRATE;
        cmdBuffer[3] = 0x00;
        cmdBuffer[4] = 0x00;
        cmdBuffer[5] = 0x00;
        cmdBuffer[6] = 0x00;
        cmdBuffer[7] = 0x00;
        cmdBuffer[8] = CO2_calculateChecksum(cmdBuffer);

        // 發送命令
        serial.writeBuffer(cmdBuffer);

        // 等待校準完成
        basic.pause(1000);
        basic.showIcon(IconNames.Yes);
    }
    /**
     * 設置測量範圍的最大值
     * @param value 最大值 (400-5000ppm)
     */
    function setConcentrationRange(value: number): void {
        // 構建命令
        let cmdBuffer = pins.createBuffer(9);
        cmdBuffer[0] = HEADER_BYTE;
        cmdBuffer[1] = DEVICE_ADDRESS;
        cmdBuffer[2] = CMD_SET_CONCENTRATION_RANGE;
        cmdBuffer[3] = 0x00;
        cmdBuffer[4] = 0x00;
        cmdBuffer[5] = 0x00;
        cmdBuffer[6] = (value >> 8) & 0xFF;
        cmdBuffer[7] = value & 0xFF;
        cmdBuffer[8] = CO2_calculateChecksum(cmdBuffer);

        // 發送命令
        serial.writeBuffer(cmdBuffer);

        // 等待設置完成
        basic.pause(100);
    }
    /**
     * 計算校驗和
     */
    function CO2_calculateChecksum(buffer: Buffer): number {
        let checksumSum = 0;
        for (let i = 1; i < 8; i++) {
            checksumSum += buffer[i];
        }
        return (~checksumSum + 1) & 0xFF;
    }


    //---------------------------------------------------------------
    // PIR偵測模組 (BMA46M422)
    //---------------------------------------------------------------
    let _staPin: DigitalPin;

    /**
     * 初始化 BM22S4221 模組
     * @param uart 通道選擇, eg: UARTChannel.UART1
     * @param statusPin STA 狀態腳位, eg: DigitalPin.P8
     */
    //% block="初始化PIR感測模組 UART 通道 %uart| STA 腳位 %Pin"
    //% subcategory="PIR感測模組" weight=100
    export function PIR_init(uart: UARTChannel, statusPin: DigitalPin): void {
        let rxPin: SerialPin;
        let txPin: SerialPin;

        if (uart == UARTChannel.UART1) {
            rxPin = SerialPin.P1;
            txPin = SerialPin.P0;
        } else if (uart == UARTChannel.UART2) {
            rxPin = SerialPin.P12;
            txPin = SerialPin.P13;
        } else if (uart == UARTChannel.UART3) {
            rxPin = SerialPin.P15;
            txPin = SerialPin.P16;
        }

        serial.redirect(txPin, rxPin, BaudRate.BaudRate9600);
        _staPin = statusPin;
        pins.setPull(_staPin, PinPullMode.PullNone);
    }

    /**
     * 檢查是否有人靠近（STA 腳位）
     */
    //% block="STA 腳位是否為高電位（有人靠近）"
    //% subcategory="PIR感測模組"
    export function getStatus(): boolean {
        return pins.digitalReadPin(_staPin) == 1;
    }

    //---------------------------------------------------------------
    // 血氧心率模組 (BMH08002)
    //---------------------------------------------------------------

    
        const HEAD_BYTE = 0x55
        const TAIL_BYTE = 0xAA
        const CMD_BYTE = 0xB1

        let initialized = false

        let _dataBuffer = [0, 0, 0]  // [SpO2, 心率, PI]
        let rxBuf: Buffer = pins.createBuffer(18)
        let t = 0
        //% blockId=bmh08002_init
        //% block="初始化 血氧模組 通道 %uart"
        //% tx.defl=SerialPin.P0
        //% rx.defl=SerialPin.P1
        //% subcategory="血氧心率模組"
        //% weight=100
    export function initialize_d(uart: UARTChannel): void {
  
            let _txPin = SerialPin.P0
            let _rxPin = SerialPin.P1
            if (uart == UARTChannel.UART1) {
                _rxPin = SerialPin.P0
                _txPin = SerialPin.P1
            } else if (uart == UARTChannel.UART2) {
                _rxPin = SerialPin.P13
                _txPin = SerialPin.P12
            } else if (uart == UARTChannel.UART3) {
                _rxPin = SerialPin.P16
                _txPin = SerialPin.P15
            }
            // 初始化序列通訊
        serial.redirect(_txPin, _rxPin , BaudRate.BaudRate38400)
            basic.pause(100)

            let buf = pins.createBuffer(5)
            buf[0] = HEAD_BYTE    // 0x55
            buf[1] = CMD_BYTE     // 0xB1
            buf[2] = 0x04
            buf[3] = 0xB5
            buf[4] = 0xAA

            serial.writeBuffer(buf)
            basic.pause(50)

            rxBuf = serial.readBuffer(18)
            basic.pause(100)

            // 檢查是否收到有效數據
            if (rxBuf.length === 18 && rxBuf[0] === HEAD_BYTE && rxBuf[1] == 0xB0 && rxBuf[17] === TAIL_BYTE) {
                initialized = true
            } else {

            }
        }

        //% blockId=bmh08002_begin_measure
        //% block="開始測量"
        //% subcategory="血氧心率模組"
        //% weight=90
        export function beginMeasure(): void {
            if (!initialized) return

            let buf = pins.createBuffer(5)
            buf[0] = HEAD_BYTE
            buf[1] = CMD_BYTE
            buf[2] = 0x00
            buf[3] = 0xB1
            buf[4] = TAIL_BYTE

            serial.writeBuffer(buf)
            basic.pause(50)
        }

        //% blockId=bmh08002_request_info
        //% block="檢查數據狀態"
        //% subcategory="血氧心率模組"
        //% weight=85
        export function requestInfo(): number {

            // 清空串口緩衝區
            do {
                rxBuf = serial.readBuffer(1)
            } while (rxBuf[0] != 0xAA)


            // 發送請求
            let buf = pins.createBuffer(5)
            buf[0] = HEAD_BYTE        // 0x55
            buf[1] = CMD_BYTE         // 0xB1
            buf[2] = 0x04
            buf[3] = 0xB5
            buf[4] = TAIL_BYTE

            serial.writeBuffer(buf)
            basic.pause(50)

            rxBuf = serial.readBuffer(18)
            basic.pause(500)


            // 檢查是否收到有效數據
            if (rxBuf.length === 18 && rxBuf[0] === HEAD_BYTE && rxBuf[1] == 0xB0 && rxBuf[17] === TAIL_BYTE) {
                // 更新數據緩衝區
                _dataBuffer[0] = rxBuf[3]     // SpO2 (D2)
                _dataBuffer[1] = rxBuf[4]     // 心率 (D3)
                _dataBuffer[2] = rxBuf[5]     // PI (D4)

                return rxBuf[2]               // 返回手指量測狀態 
            }

            return 3
        }


        //% blockId=bmh08002_get_pi
        //% block="讀取血流灌注指數"
        //% subcategory="血氧心率模組"
        //% weight=80
        export function getPI(): number {
            return Math.round(_dataBuffer[2]) / 10  // PI 需要除以 10
        }

        //% blockId=bmh08002_get_heart_rate
        //% block="讀取心率"
        //% subcategory="血氧心率模組"
        //% weight=82
        export function getHeartRate(): number {
            return _dataBuffer[1]
        }

        //% blockId=bmh08002_get_spo2
        //% block="讀取血氧"
        //% subcategory="血氧心率模組"
        //% weight=84
        export function getSpO2(): number {
            return _dataBuffer[0]
        }
    



    //---------------------------------------------------------------
    // 紅外測溫模組
    //---------------------------------------------------------------
    const FIXED_ADDR = 0x28;     // 固定I2C地址
    const BODY_TEMP_CMD = 0x0A;  // 測溫指令碼
    let RED_isInitialized = false;   // 初始化狀態旗標

    //% block="啟動紅外測溫" subcategory="紅外測溫模組" color=#0fbcf9 weight=255
    export function startMeasurement(): void {
        if (!RED_isInitialized) {
            pins.i2cWriteNumber(FIXED_ADDR, 0, NumberFormat.UInt8BE);
            const configBuffer = pins.createBuffer(3);
            configBuffer.setNumber(NumberFormat.UInt8LE, 0, 0x28);
            configBuffer.setNumber(NumberFormat.UInt8LE, 1, 0x00);
            configBuffer.setNumber(NumberFormat.UInt8LE, 2, 0x28);
            pins.i2cWriteBuffer(FIXED_ADDR, configBuffer);

            RED_isInitialized = true;
            basic.pause(50);
        }
        pins.i2cWriteNumber(FIXED_ADDR, BODY_TEMP_CMD, NumberFormat.UInt8BE);
    }

    //% block="讀取紅外溫度" subcategory="紅外測溫模組" color=#0fbcf9 weight=90
    export function readTemperature(): number {
        const dataBuffer = pins.i2cReadBuffer(FIXED_ADDR, 3);
        // 合併高低位並轉換攝氏
        return ((dataBuffer[1] << 8) | dataBuffer[0]) / 10.0;
    }



    //---------------------------------------------------------------
    // 4key 觸控模組 (BMK52M134)
    //---------------------------------------------------------------
    const BMK52M134_MODULE_MID = 0x56;
    const BMK52M134_DEFAULT_I2C_ADDR = 0x71;
    const BMK52M134_BROADCAST_ID = 0x00;

    const BMK52M134_CMD_CHECK_MODULE = 0x01;
    const BMK52M134_CMD_KEY_SCAN = 0x02;
    const BMK52M134_CMD_SET_THR = 0x03;
    const BMK52M134_CMD_GET_THR = 0x04;
    const BMK52M134_CMD_SET_SLEEPEN = 0x05;
    const BMK52M134_CMD_GET_SLEEPEN = 0x06;

    let BMK52M134_intPin: DigitalPin;
    let BMK52M134_moduleCount = 1;
    let BMK52M134_initialized = false;

    export enum KeyNumber {
        //% block="按鍵1"
        KEY1 = 0x01,
        //% block="按鍵2"
        KEY2 = 0x02,
        //% block="按鍵3"
        KEY3 = 0x04,
        //% block="按鍵4"
        KEY4 = 0x08
    }

    export enum SleepMode {
        //% block="停用"
        DISABLE = 0x00,
        //% block="啟用"
        ENABLE = 0x01
    }

    //% block="初始化觸控模組|INT接腳 %pin"
    //% subcategory="4key觸控模組" color=#0fbcf9 weight=255
    export function BMK52M134_init(pin: DigitalPin): void {
        BMK52M134_intPin = pin;
        pins.setPull(BMK52M134_intPin, PinPullMode.PullUp);
        pins.i2cWriteNumber(BMK52M134_DEFAULT_I2C_ADDR, 0x00, NumberFormat.Int8LE);
        basic.pause(500);
        BMK52M134_moduleCount = BMK52M134_getModuleCount();
        BMK52M134_setThreshold(16);
        BMK52M134_initialized = true;
    }

    //% block="獲取模組數量" subcategory="4key觸控模組" color=#0fbcf9
    export function BMK52M134_getModuleCount(): number {
        let buf = pins.createBuffer(5);
        buf[0] = BMK52M134_MODULE_MID;
        buf[1] = BMK52M134_BROADCAST_ID;
        buf[2] = 0x02;
        buf[3] = BMK52M134_CMD_CHECK_MODULE;
        buf[4] = BMK52M134_MODULE_MID + BMK52M134_BROADCAST_ID + 0x02 + BMK52M134_CMD_CHECK_MODULE;

        pins.i2cWriteBuffer(BMK52M134_DEFAULT_I2C_ADDR, buf);
        basic.pause(20);
        let rxBuf = pins.i2cReadBuffer(BMK52M134_DEFAULT_I2C_ADDR, 6);
        return rxBuf[4];
    }

    //% block="設定觸發閾值 %threshold" subcategory="4key觸控模組" color=#0fbcf9
    //% threshold.min=10 threshold.max=64
    //% weight=85
    export function BMK52M134_setThreshold(threshold: number): void {
        if (!BMK52M134_initialized) return;
        let buf = pins.createBuffer(6);
        buf[0] = BMK52M134_MODULE_MID;
        buf[1] = BMK52M134_BROADCAST_ID;
        buf[2] = 0x03;
        buf[3] = BMK52M134_CMD_SET_THR;
        buf[4] = threshold;
        buf[5] = BMK52M134_MODULE_MID + BMK52M134_BROADCAST_ID + 0x03 + BMK52M134_CMD_SET_THR + threshold;
        pins.i2cWriteBuffer(BMK52M134_DEFAULT_I2C_ADDR, buf);
        basic.pause(20);
    }

    //% block="獲取按鍵狀態" subcategory="4key觸控模組" color=#0fbcf9
    export function BMK52M134_getKeyValue(): number {
        if (!BMK52M134_initialized) return 0;
        let buf = pins.createBuffer(5);
        buf[0] = BMK52M134_MODULE_MID;
        buf[1] = BMK52M134_BROADCAST_ID;
        buf[2] = 0x02;
        buf[3] = BMK52M134_CMD_KEY_SCAN;
        buf[4] = BMK52M134_MODULE_MID + BMK52M134_BROADCAST_ID + 0x02 + BMK52M134_CMD_KEY_SCAN;
        pins.i2cWriteBuffer(BMK52M134_DEFAULT_I2C_ADDR, buf);
        basic.pause(20);

        let rxBuf = pins.i2cReadBuffer(BMK52M134_DEFAULT_I2C_ADDR, 5 + BMK52M134_moduleCount);
        return rxBuf[4];
    }

    //% block="設定休眠模式 %mode" subcategory="4key觸控模組" color=#0fbcf9 weight=10
    export function setSleepMode(mode: SleepMode): void {
        if (!BMK52M134_initialized) return;

        let buf = pins.createBuffer(6);
        buf[0] = BMK52M134_MODULE_MID;
        buf[1] = BMK52M134_BROADCAST_ID;
        buf[2] = 0x03;
        buf[3] = BMK52M134_CMD_SET_SLEEPEN;
        buf[4] = mode;
        buf[5] = BMK52M134_MODULE_MID + BMK52M134_BROADCAST_ID + 0x03 + BMK52M134_CMD_SET_SLEEPEN + mode;
        pins.i2cWriteBuffer(BMK52M134_DEFAULT_I2C_ADDR, buf);
        basic.pause(20);
    }

    //% block="%key 被按下" subcategory="4key觸控模組" color=#0fbcf9 weight=70
    export function isKeyPressed(key: KeyNumber): boolean {
        let keyValue = BMK52M134_getKeyValue();
        return (keyValue & key) !== 0;
    }



    //---------------------------------------------------------------
    // 0.96吋OLED顯示模組
    //---------------------------------------------------------------
    let font: Buffer;
    let _screen: Buffer = pins.createBuffer(128 * 64 / 8);
    const _I2CAddr = 0x3C;
    const SSD1306_SETCONTRAST = 0x81;
    const SSD1306_SETCOLUMNADRESS = 0x21;
    const SSD1306_SETPAGEADRESS = 0x22;
    const SSD1306_DISPLAYALLON_RESUME = 0xA4;
    const SSD1306_DISPLAYALLON = 0xA5;
    const SSD1306_NORMALDISPLAY = 0xA6;
    const SSD1306_INVERTDISPLAY = 0xA7;
    const SSD1306_DISPLAYOFF = 0xAE;
    const SSD1306_DISPLAYON = 0xAF;
    const SSD1306_SETDISPLAYOFFSET = 0xD3;
    const SSD1306_SETCOMPINS = 0xDA;
    const SSD1306_SETVCOMDETECT = 0xDB;
    const SSD1306_SETDISPLAYCLOCKDIV = 0xD5;
    const SSD1306_SETPRECHARGE = 0xD9;
    const SSD1306_SETMULTIPLEX = 0xA8;
    const SSD1306_SETLOWCOLUMN = 0x00;
    const SSD1306_SETHIGHCOLUMN = 0x10;
    const SSD1306_SETSTARTLINE = 0x40;
    const SSD1306_MEMORYMODE = 0x20;
    const SSD1306_COMSCANINC = 0xC0;
    const SSD1306_COMSCANDEC = 0xC8;
    const SSD1306_SEGREMAP = 0xA0;
    const SSD1306_CHARGEPUMP = 0x8D;
    const chipAdress = 0x3C;
    const xOffset = 0;
    const yOffset = 0;
    let charX = 0;
    let charY = 0;
    let displayWidth = 128;
    let displayHeight = 64 / 8;
    let screenSize = 0;
    let loadStarted: boolean;
    let loadPercent: number;
    let _ZOOM = 1;   // OLED放大倍數 (高度)
    let _ZOOM_X = 2; // 寬度放大倍數 (只影響寬度)

    function command(cmd: number) {
        let buf = pins.createBuffer(2);
        buf[0] = 0x00;
        buf[1] = cmd;
        pins.i2cWriteBuffer(chipAdress, buf, false);
    }
    command(0xd6); // 設置放大指令
    command(_ZOOM);

    //% block="初始化 OLED 寬 $width 高 $height"
    //% subcategory="0.96吋OLED顯示模組" color=#0fbcf9 weight=255
    export function init(width: number, height: number) {
        command(SSD1306_DISPLAYOFF);
        command(SSD1306_SETDISPLAYCLOCKDIV);
        command(0x80);
        command(SSD1306_SETMULTIPLEX);
        command(0x3F);
        command(SSD1306_SETDISPLAYOFFSET);
        command(0x0);
        command(SSD1306_SETSTARTLINE | 0x0);
        command(SSD1306_CHARGEPUMP);
        command(0x14);
        command(SSD1306_MEMORYMODE);
        command(0x00);
        command(SSD1306_SEGREMAP | 0x1);
        command(SSD1306_COMSCANDEC);
        command(SSD1306_SETCOMPINS);
        command(0x12);
        command(SSD1306_SETCONTRAST);
        command(0xCF);
        command(SSD1306_SETPRECHARGE);
        command(0xF1);
        command(SSD1306_SETVCOMDETECT);
        command(0x40);
        command(SSD1306_DISPLAYALLON_RESUME);
        command(SSD1306_NORMALDISPLAY);
        command(SSD1306_DISPLAYON);

        displayWidth = width;
        displayHeight = height / 8;
        screenSize = displayWidth * displayHeight;
        charX = xOffset;
        charY = yOffset;

        // 這裡載入字型 (font) 的資料，可視實際需求裁切
        font = hex`
        0000000000
        3E5B4F5B3E
        3E6B4F6B3E
        1C3E7C3E1C
        183C7E3C18
        1C577D571C
        1C5E7F5E1C
        00183C1800
        FFE7C3E7FF
        0018241800
        FFE7DBE7FF
        30483A060E
        2629792926
        407F050507
        407F05253F
        5A3CE73C5A
        7F3E1C1C08
        081C1C3E7F
        14227F2214
        5F5F005F5F
        06097F017F
        006689956A
        6060606060
        94A2FFA294
        08047E0408
        10207E2010
        08082A1C08
        081C2A0808
        1E10101010
        0C1E0C1E0C
        30383E3830
        060E3E0E06
        0000000000
        00005F0000
        0007000700
        147F147F14
        242A7F2A12
        2313086462
        3649562050
        0008070300
        001C224100
        0041221C00
        2A1C7F1C2A
        08083E0808
        0080703000
        0808080808
        0000606000
        2010080402
        3E5149453E
        00427F4000
        7249494946
        2141494D33
        1814127F10
        2745454539
        3C4A494931
        4121110907
        3649494936
        464949291E
        0000140000
        0040340000
        0008142241
        1414141414
        0041221408
        0201590906
        3E415D594E
        7C1211127C
        7F49494936
        3E41414122
        7F4141413E
        7F49494941
        7F09090901
        3E41415173
        7F0808087F
        00417F4100
        2040413F01
        7F08142241
        7F40404040
        7F021C027F
        7F0408107F
        3E4141413E
        7F09090906
        3E4151215E
        7F09192946
        2649494932
        03017F0103
        3F4040403F
        1F2040201F
        3F4038403F
        6314081463
        0304780403
        6159494D43
        007F414141
        0204081020
        004141417F
        0402010204
        4040404040
        0003070800
        2054547840
        7F28444438
        3844444428
        384444287F
        3854545418
        00087E0902
        18A4A49C78
        7F08040478
        00447D4000
        2040403D00
        7F10284400
        00417F4000
        7C04780478
        7C08040478
        3844444438
        FC18242418
        18242418FC
        7C08040408
        4854545424
        04043F4424
        3C4040207C
        1C2040201C
        3C4030403C
        4428102844
        4C9090907C
        4464544C44
        0008364100
        0000770000
        0041360800
        0201020402
        3C2623263C
        1EA1A16112
        3A4040207A
        3854545559
        2155557941
        2154547841
        2155547840
        2054557940
        0C1E527212
        3955555559
        3954545459
        3955545458
        0000457C41
        0002457D42
        0001457C40
        F0292429F0
        F0282528F0
        7C54554500
        2054547C54
        7C0A097F49
        3249494932
        3248484832
        324A484830
        3A4141217A
        3A42402078
        009DA0A07D
        3944444439
        3D4040403D
        3C24FF2424
        487E494366
        2B2FFC2F2B
        FF0929F620
        C0887E0903
        2054547941
        0000447D41
        3048484A32
        384040227A
        007A0A0A72
        7D0D19317D
        2629292F28
        2629292926
        30484D4020
        3808080808
        0808080838
        2F10C8ACBA
        2F102834FA
        00007B0000
        08142A1422
        22142A1408
        AA005500AA
        AA55AA55AA
        000000FF00
        101010FF00
        141414FF00
        1010FF00FF
        1010F010F0
        141414FC00
        1414F700FF
        0000FF00FF
        1414F404FC
        141417101F
        10101F101F
        1414141F00
        101010F000
        0000001F10
        1010101F10
        101010F010
        000000FF10
        1010101010
        101010FF10
        000000FF14
        0000FF00FF
        00001F1017
        0000FC04F4
        1414171017
        1414F404F4
        0000FF00F7
        1414141414
        1414F700F7
        1414141714
        10101F101F
        141414F414
        1010F010F0
        00001F101F
        0000001F14
        000000FC14
        0000F010F0
        1010FF10FF
        141414FF14
        1010101F00
        000000F010
        FFFFFFFFFF
        F0F0F0F0F0
        FFFFFF0000
        000000FFFF
        0F0F0F0F0F
        3844443844
        7C2A2A3E14
        7E02020606
        027E027E02
        6355494163
        3844443C04
        407E201E20
        06027E0202
        99A5E7A599
        1C2A492A1C
        4C7201724C
        304A4D4D30
        3048784830
        BC625A463D
        3E49494900
        7E0101017E
        2A2A2A2A2A
        44445F4444
        40514A4440
        40444A5140
        0000FF0103
        E080FF0000
        08086B6B08
        3612362436
        060F090F06
        0000181800
        0000101000
        3040FF0101
        001F01011E
        00191D1712
        003C3C3C3C
        0000000000`;

        loadStarted = false;
        loadPercent = 0;
        clear();
    }

    //% block="清除畫面"
    //% subcategory="0.96吋OLED顯示模組" color=#0fbcf9 weight=3
    export function clear() {
        loadStarted = false;
        loadPercent = 0;
        command(SSD1306_SETCOLUMNADRESS);
        command(0x00);
        command(displayWidth - 1);
        command(SSD1306_SETPAGEADRESS);
        command(0x00);
        command(displayHeight - 1);

        let data = pins.createBuffer(17);
        data[0] = 0x40;
        for (let i = 1; i < 17; i++) {
            data[i] = 0x00;
        }
        for (let i = 0; i < screenSize; i += 16) {
            pins.i2cWriteBuffer(chipAdress, data, false);
        }
        charX = xOffset;
        charY = yOffset;
    }

    //% block="加入新的一行"
    //% subcategory="0.96吋OLED顯示模組" color=#0fbcf9 weight=4
    export function newLine() {
        charY++;
        charX = xOffset;
    }

    //% block="顯示文字(無換行) $str"
    //% subcategory="0.96吋OLED顯示模組" color=#0fbcf9 weight=6
    export function writeString(str: string) {
        for (let i = 0; i < str.length; i++) {
            if (charX > displayWidth - (5 * _ZOOM_X)) {
                newLine();
            }
            drawChar(charX, charY, str.charAt(i));
            charX += 5 * _ZOOM_X;
        }
    }

    //% block="顯示數字(無換行) $n"
    //% subcategory="0.96吋OLED顯示模組" color=#0fbcf9 weight=5
    export function writeNum(n: number) {
        let numString = n.toString();
        writeString(numString);
    }

    //% block="顯示文字 $str"
    //% subcategory="0.96吋OLED顯示模組" color=#0fbcf9 weight=8
    export function writeStringNewLine(str: string) {
        writeString(str);
        newLine();
    }

    //% block="顯示數字 $n"
    //% subcategory="0.96吋OLED顯示模組" color=#0fbcf9 weight=7
    export function writeNumNewLine(n: number) {
        writeNum(n);
        newLine();
    }

    function drawChar(x: number, y: number, c: string) {
        command(SSD1306_SETCOLUMNADRESS);
        command(x);
        command(x + 5 * _ZOOM_X);
        command(SSD1306_SETPAGEADRESS);
        command(y);
        command(y);

        let line = pins.createBuffer(1 + 5 * _ZOOM_X);
        line[0] = 0x40;

        for (let i = 0; i < 5; i++) {
            let charIndex = c.charCodeAt(0);
            let data = font.getNumber(NumberFormat.UInt8BE, 5 * charIndex + i);
            for (let z = 0; z < _ZOOM_X; z++) {
                line[1 + i * _ZOOM_X + z] = data;
            }
        }
        pins.i2cWriteBuffer(chipAdress, line, false);
    }
}



//% block="智慧農業" color=#0fbc11 icon="\uf06c"
namespace 智慧農業 {
    /**
     * WiFi 模組積木
     */
    let isInitialized = false;
    /**
      * 讀取模組的回應
      * @returns 回應字串
      */
    export function readResponse(): string {
        let response = "";
        let startTime = input.runningTime();
        let hasData = false;

        while (input.runningTime() - startTime < 4000) {
            let data = serial.readString();
            if (data && data.length > 0 && data.length < 22) {
                //basic.showString(data);
                response += data;
                hasData = true;
                basic.pause(10);
            }
        }

        if (!hasData) {
            basic.showString("NO RESP");
        }

        return response.trim(); // 去除多餘的空格或換行符，返回回應
    }


    /**
    * WiFi 熱點
    * @param ssid WiFi 名稱, eg: "my_wifi"
    * @param password WiFi 密碼, eg: "12345678"
     */
    //% block="WiFi 熱點 SSID %ssid 密碼 %password"
    export function connectToWiFi(ssid: string, password: string): void {
        if (!isInitialized) {
            let command = "AT\r\n";
            let command1 = `AT+WMODE=3,0\r\n`;
            let command2 = `AT+WJAP=${ssid},${password}\r\n`;

            serial.redirect(SerialPin.P0, SerialPin.P1, 115200); // 使用 P0 和 P1 作為 UART

            //智慧家居.writeStringNewLine("Open your HOTSPOT!");

            let response = "";
            serial.writeString(command);
            basic.pause(100);
            response = readResponse();
            if (response.includes("OK")) {
                let response1 = "";
                serial.writeString(command1);
                basic.pause(500);
                response1 = readResponse();
                if (response1.includes("OK")) {
                    let response2 = "";

                    while (true) {
                        serial.writeString(command2);
                        basic.pause(500);
                        response2 = readResponse();

                        if (response2.includes("OK")) {
                            //智慧家居.clear()
                            //智慧家居.writeStringNewLine("WiFi Connected!")
                            //智慧家居.writeStringNewLine("SSID: " + ssid)
                            basic.pause(500)
                            isInitialized = true
                            break
                        } else {
                            //智慧家居.clear()
                            //智慧家居.writeStringNewLine("Connecting WiFi...")
                        }
                    }

                } else {
                    //智慧家居.writeStringNewLine("WiFi Mode Set ERROR");
                }
            }
        } else {
            basic.showString("ERROR"); // 顯示錯誤
        }
    }



    /**
  * 發送 MQTT 請求
  */
    //% block="ThingSpeak |  Client ID %client| Username %name| Password %password|"
    export function sendMQTT(client: string, name: string, password: string): void {
        if (isInitialized) {

            //智慧家居.clear()
            //智慧家居.writeStringNewLine("Waiting for upload...");

            let command1 = `AT+MQTT=1,"mqtt3.thingspeak.com"\r\n`;
            let command2 = `AT+MQTT=2,"1883"\r\n`;
            let command3 = `AT+MQTT=3,1\r\n`;
            let command4 = `AT+MQTT=4,"${client}"\r\n`;
            let command5 = `AT+MQTT=5,"${name}"\r\n`;
            let command6 = `AT+MQTT=6,"${password}"\r\n`;
            let command7 = `AT+MQTT\r\n`;
            let command8 = `AT+MQTT?\r\n`;


            let response = ""
            serial.writeString(command1);
            basic.pause(100);
            response = readResponse(); // 讀取回應
            basic.pause(500);

            let response1 = ""
            serial.writeString(command2);
            basic.pause(500);
            response1 = readResponse();
            //智慧家居.clear();

            serial.writeString(command3);
            basic.pause(500);
            //智慧家居.clear();

            serial.writeString(command4);
            basic.pause(500);
            //智慧家居.clear();

            serial.writeString(command5);
            basic.pause(500);
            //智慧家居.clear();

            serial.writeString(command6);
            basic.pause(500);
            //智慧家居.clear();

            serial.writeString(command7);
            basic.pause(500);
            //智慧家居.clear();

            serial.writeString(command8);
            basic.pause(500);
            //智慧家居.clear();

        } else {
            //智慧家居.writeStringNewLine("ERROR: Module not initialized!");
        }
    }


    /**
    * 發送 MQTT 請求
     */
    //% expandableArgumentMode="enabled"
    //% block="PUBLISHTOPIC 發布訊息 | Channel ID %topic| field1_data %data||field2_data %data1| field3_data %data2| field4_data %data3| field5_data %data4| field6_data %data5| field7_data %data6| field8_data %data7"
    //% topic.defl=0 data.defl=0 data1.defl=0 data2.defl=0 data3.defl=0 data4.defl=0 data5.defl=0 data6.defl=0 data.defl=0
    export function PUBLISHTOPIC(topic: number = 0, data: number = 0, data1: number = 0, data2: number = 0, data3: number = 0, data4: number = 0, data5: number = 0, data6: number = 0, data7: number = 0): void {
        let response = "";
        let topic1 = "channels" + "/" + topic + "/" + "publish";
        let data_buf1 = "field1=" + data;
        let data_buf2 = "field2=" + data1;
        let data_buf3 = "field3=" + data2;
        let data_buf4 = "field4=" + data3;
        let data_buf5 = "field5=" + data4;
        let data_buf6 = "field6=" + data5;
        let data_buf7 = "field7=" + data6;
        let data_buf8 = "field8=" + data7;

        let command = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf1 + "\r\n";
        let command1 = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf2 + "\r\n";
        let command2 = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf3 + "\r\n";
        let command3 = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf4 + "\r\n";
        let command4 = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf5 + "\r\n";
        let command5 = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf6 + "\r\n";
        let command6 = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf7 + "\r\n";
        let command7 = "AT+MQTTPUB=" + topic1 + ",1,0," + data_buf8 + "\r\n";

        for (let i = 0; i < 8; i++) {
            let retryCount = 0;
            let success = false;
            let currentCommand = "";

            switch (i) {
                case 0:
                    currentCommand = command;
                    break;
                case 1:
                    currentCommand = command1;
                    break;
                case 2:
                    currentCommand = command2;
                    break;
                case 3:
                    currentCommand = command3;
                    break;
                case 4:
                    currentCommand = command4;
                    break;
                case 5:
                    currentCommand = command5;
                    break;
                case 6:
                    currentCommand = command6;
                    break;
                case 7:
                    currentCommand = command7;
                    break;
            }

            while (retryCount <= 2 && !success) {
                serial.writeString(currentCommand);
                basic.pause(500);
                response = readResponse();

                if (response.includes("ERROR")) {
                    retryCount++;
                    if (retryCount <= 2) {
                        basic.pause(500);
                    }
                } else {
                    success = true;
                    basic.pause(500);
                }
            }
        }

    }




    // 常量定義
    const HEAD1 = 0x42;
    const HEAD2 = 0x4D;
    const CLASS = 0x61;
    const CMD_READ_TDS = 0x01;
    const CMD_TX_LENGTH = 0x01;
    const CMD_RX_LENGTH = 0x0C;  // 12 字節

    let moduleID = 1;
    let initialized = false;
    let lastConnectionStatus = false;


    //% block="初始化 TDS 模組 通道 $uartChannel  ID $id"
    //% subcategory="水質感測器"
    //% id.min=1 id.max=255 id.defl=1
    export function begin(uartChannel: UARTChannel, id: number = 1): void {
        moduleID = id;
        let rxPin: SerialPin;
        let txPin: SerialPin;

        // 根據選擇的 UART 通道設置對應的 RX 和 TX 腳位
        if (uartChannel == UARTChannel.UART1) {
            rxPin = SerialPin.P1; // UART1 RX
            txPin = SerialPin.P0; // UART1 TX
        } else if (uartChannel == UARTChannel.UART2) {
            rxPin = SerialPin.P13; // UART2 RX
            txPin = SerialPin.P12; // UART2 TX
        } else if (uartChannel == UARTChannel.UART3) {
            rxPin = SerialPin.P16; // UART3 RX
            txPin = SerialPin.P15; // UART3 TX
        }

        serial.redirect(txPin, rxPin, BaudRate.BaudRate9600);
        serial.setRxBufferSize(128);
        serial.setTxBufferSize(64);


        serial.readString();

        // 等待模組初始化
        basic.pause(1000);

        initialized = true;
        isInited = false
    }

    /**
     * 計算校驗和
     */
    function calculateChecksum(buffer: Buffer, length: number): number {
        let sum = 0;
        for (let i = 0; i < length; i++) {
            sum += buffer[i];
        }
        return (~sum + 1) & 0xFF;
    }

    /**
     * 發送命令並讀取回應
     */
    function sendCommand(channel: TDSChannel): Buffer {
        if (!initialized) {
            return pins.createBuffer(0);
        }


        serial.readString();


        let cmd = pins.createBuffer(8);
        cmd[0] = HEAD1;
        cmd[1] = HEAD2;
        cmd[2] = CLASS;
        cmd[3] = moduleID;
        cmd[4] = CMD_READ_TDS;
        cmd[5] = CMD_TX_LENGTH;
        cmd[6] = channel;
        cmd[7] = calculateChecksum(cmd, 7);

        serial.writeBuffer(cmd);

        basic.pause(500);


        let response = serial.readBuffer(CMD_RX_LENGTH);

        // 如果回應長度不足，再等待一段時間
        if (response.length < CMD_RX_LENGTH) {
            basic.pause(300);
            let moreData = serial.readBuffer(CMD_RX_LENGTH - response.length);

            let combinedResponse = pins.createBuffer(response.length + moreData.length);
            for (let i = 0; i < response.length; i++) {
                combinedResponse[i] = response[i];
            }
            for (let i = 0; i < moreData.length; i++) {
                combinedResponse[response.length + i] = moreData[i];
            }
            response = combinedResponse;
        }

        return response;
    }

    /**
     * 檢查回應的基本有效性
     */
    function isValidResponse(response: Buffer): boolean {
        if (response.length < 8) {
            return false;
        }
        if (response[0] != HEAD1 || response[1] != HEAD2) {
            return false;
        }
        if (response[2] != CLASS) {
            return false;
        }
        if (response[3] != moduleID) {
            return false;
        }
        return true;
    }


    /**
     * 讀取水溫
     * @param channel 選擇通道, eg: TDSChannel.Channel1
     */
    //% block="讀取 $channel 水溫"
    //% subcategory="水質感測器"
    function readTemperature_TDS(channel: TDSChannel): number {
        readTemperature_TDS
        let response = sendCommand(channel);

        if (!isValidResponse(response)) {
            return -1;
        }

        if (response.length >= 12) {
            let tempHigh = response[9];
            let tempLow = response[10];
            let tempValue = (tempHigh << 8) | tempLow;

            if (tempValue == 1500) {
                return -999;
            } else if (tempValue == 65486) {
                return -998;
            }

            return tempValue / 10;
        }

        return -2;
    }

    /**
     * 讀取 TDS 值
     * @param channel 選擇通道, eg: TDSChannel.Channel1
     */
    //% block="讀取 $channel TDS值"
    //% subcategory="水質感測器"
    function readTDS(channel: TDSChannel): number {
        let response = sendCommand(channel);

        if (!isValidResponse(response)) {
            return -1;
        }

        if (response.length >= 12) {
            let tdsHigh = response[7];
            let tdsLow = response[8];
            let tdsValue = (tdsHigh << 8) | tdsLow;
            return tdsValue / 10;
        }

        return -2;
    }

    /**
     * @param channel 選擇通道, eg: TDSChannel.Channel1
     */
    //% block="TDS值 $channel"
    //% subcategory="水質感測器"
    export function getTDSValue(channel: TDSChannel): number {
        return readTDS(channel);
    }

    /**
     * @param channel 選擇通道, eg: TDSChannel.Channel1
     */
    //% block="溫度值 $channel"
    //% subcategory="水質感測器"
    export function getTemperature(channel: TDSChannel): number {
        return readTemperature_TDS(channel);
    }

    /**
     * 檢查 TDS 模組連接狀態
     */
    //% block="檢查 TDS 模組連接狀態"
    //% subcategory="水質感測器"
    export function checkConnection(): boolean {
        if (!initialized) {
            return false;
        }

        let response = sendCommand(TDSChannel.Channel1);
        let connected = isValidResponse(response);
        lastConnectionStatus = connected;
        return connected;
    }

    /**
     * 重置 TDS 模組連接
     */
    //% block="重置 TDS 模組連接"
    //% subcategory="水質感測器"
    export function resetConnection(uartChannel: UARTChannel, id: number = 1): void {
        begin(uartChannel, id);
        checkConnection();
    }



    //----------------------------------------------------------
    // 土壤濕度傳感模組
    //----------------------------------------------------------

    const CHECK_OK = 0
    const CHECK_ERROR = 3

    let isInited = false
    let moduleID_S = 1
    let staPin: DigitalPin = DigitalPin.P2

    //% block="初始化 土壤模組 使用通道 $uartChannel STA 腳位 $sta"
    //% weight=100
    //% sta.fieldEditor="gridpicker" sta.fieldOptions.columns=4
    //% subcategory="土壤感測器"
    export function init_S(uartChannel: UARTChannel, sta: DigitalPin): void {

        //if (isInited) return
        staPin = sta
        pins.digitalWritePin(staPin, 0)
        pins.setPull(staPin, PinPullMode.PullNone)

        if (uartChannel == UARTChannel.UART1)
            serial.redirect(SerialPin.P1, SerialPin.P0, BaudRate.BaudRate9600)
        else if (uartChannel == UARTChannel.UART2)
            serial.redirect(SerialPin.P12, SerialPin.P13, BaudRate.BaudRate9600)
        else if (uartChannel == UARTChannel.UART3)
            serial.redirect(SerialPin.P15, SerialPin.P16, BaudRate.BaudRate9600)

        serial.setRxBufferSize(7);
        serial.setTxBufferSize(8);
        isInited = true

        basic.pause(100)
        /*智慧農業.writeNum(1)
        basic.pause(1000)
        智慧農業.clear()*/


    }

    //% blockId="bm25s2621_get_id" block="取得模組 ID"
    //% blockGap=8
    //% weight=90
    //% subcategory="土壤感測器"
    export function getID(): number {
        return rs485Read(0xFF, 0x00, 1)
        //智慧農業.writeNum(4)
    }

    //% block="讀取溫度(ID= %id)"
    //% weight=80
    //% subcategory="土壤感測器"
    export function readTemperature_S(id: number): number {
        return rs485Read(id, 0x02, 1)
        //智慧農業.writeNum(5)
    }

    //% block="讀取土壤濕度(ID= %id)"
    //% weight=70
    //% subcategory="土壤感測器"
    export function readMoisture(id: number): number {
        return rs485Read(id, 0x01, 1)
    }

    function rs485Read(id: number, address: number, quantity: number): number {
        let buf = pins.createBuffer(8)
        buf.setNumber(NumberFormat.UInt8LE, 0, id)
        buf.setNumber(NumberFormat.UInt8LE, 1, 0x03)
        buf.setNumber(NumberFormat.UInt16LE, 3, address)
        buf.setNumber(NumberFormat.UInt16LE, 5, quantity)
        let crc = modbusCRC(buf.slice(0, 6))
        buf.setNumber(NumberFormat.UInt8LE, 6, crc & 0xff)
        buf.setNumber(NumberFormat.UInt8LE, 7, (crc >> 8) & 0xff)
        //serial.readString();
        //serial.readBuffer(0) // 清空接收殘留
        pins.digitalWritePin(staPin, 1)
        basic.pause(10)
        /*智慧農業.writeNum(2)
        basic.pause(1000)
        智慧農業.clear()*/
        //basic.showNumber(2)
        serial.writeBuffer(buf)
        /*智慧農業.writeNum(3)
        basic.pause(1000)
        智慧農業.clear()*/
        basic.pause(10)
        pins.digitalWritePin(staPin, 0) // 提早切回 RX 模式
        basic.pause(100) // 等待模組回應


        let recvLen = 5 + quantity * 2
        //basic.showNumber(recvLen)
        let recv = serial.readBuffer(recvLen)
        //basic.showNumber(4)
        if (recv.length >= recvLen && recv.getUint8(1) == 0x03 && recv.getUint8(2) == quantity * 2) {
            return (recv.getUint8(3) << 8) | recv.getUint8(4)
        }

        return CHECK_ERROR
        //return 0
    }

    function modbusCRC(buf: Buffer): number {
        let crc = 0xFFFF
        for (let pos = 0; pos < buf.length; pos++) {
            crc ^= buf[pos]
            for (let i = 0; i < 8; i++) {
                if ((crc & 1) != 0)
                    crc = (crc >> 1) ^ 0xA001
                else
                    crc >>= 1
            }
        }
        return crc
    }


    //----------------------------------------------------------
    // 數位型溫溼度感測模組
    //----------------------------------------------------------
    let dataBuff: number[] = []; // 暫存資料
    export enum TemperatureUnit {
        //% block="華氏"
        Fahrenheit,
        //% block="攝氏"
        Celsius
    }
    class BM25S2021_1 {
        // 初始化函數
        begin(): void {
            // MakeCode 預設處理 I2C 初始化，無需額外設定
        }

        // 讀取溫度
        //% block="讀取溫度 (單位：%unit)"
        readTemperature(unit: TemperatureUnit): number {
            let temperature = 0;
            let sendbuf: number[] = [0x03, 0x02, 0x02]; // 讀取溫度命令

            // 寄送命令並讀取資料
            this.writeBytes(sendbuf, 0x5C); // 感測器地址為 0x5C
            basic.pause(2); // 等待感測器響應

            if (this.readBytes(0x5C, 4) === 0) { // 讀取 4 位元組
                temperature = (dataBuff[2] << 8) | dataBuff[3]; // 合併高低位數據
                if (unit === TemperatureUnit.Fahrenheit) {
                    temperature = temperature * 0.18 + 32; // 華氏溫度轉換
                } else {
                    temperature = temperature / 10; // 攝氏溫度處理
                }
            }

            return temperature;
        }

        // 讀取溼度
        //% block="讀取溼度"
        readHumidity(): number {
            let humidity = 0;
            let sendbuf: number[] = [0x03, 0x02, 0x01]; // 讀取溼度命令

            // 寄送命令並讀取資料
            this.writeBytes(sendbuf, 0x5C); // 感測器地址為 0x5C
            basic.pause(2); // 等待感測器響應

            if (this.readBytes(0x5C, 4) === 0) { // 讀取 4 位元組
                humidity = (dataBuff[2] << 8) | dataBuff[3]; // 合併高低位數據
                humidity = humidity / 10; // 溼度數據處理
            }

            return humidity;
        }

        // 寄送 I2C 資料
        private writeBytes(sendbuf: number[], addr: number): void {
            let buffer = pins.createBuffer(sendbuf.length);
            for (let i = 0; i < sendbuf.length; i++) {
                buffer.setNumber(NumberFormat.UInt8LE, i, sendbuf[i]);
            }
            pins.i2cWriteBuffer(addr, buffer); // 使用完整的 I2C buffer 寄送
        }

        // 讀取 I2C 資料
        private readBytes(addr: number, length: number): number {
            try {
                let buffer = pins.i2cReadBuffer(addr, length); // 從指定地址讀取多位元組
                for (let i = 0; i < length; i++) {
                    dataBuff[i] = buffer.getNumber(NumberFormat.UInt8LE, i);
                }
                return 0; // 成功讀取返回 0
            } catch {
                return -1; // 讀取失敗返回 -1
            }
        }
    }
    let bm25: BM25S2021_1;

    // I2C 初始化設定
    //% block="初始化溫濕度感測器" subcategory="數位型溫溼度感測模組"
    //% weight=100
    export function initializeBM25S2021IIC(): void {
        bm25 = new BM25S2021_1();
        bm25.begin();
    }

    // 讀取溫度（傳回華氏或攝氏）
    //% block="讀取溫度 (單位：%unit)" subcategory="數位型溫溼度感測模組"
    export function readTemperature(unit: TemperatureUnit): number {
        return bm25.readTemperature(unit);
    }

    // 讀取溼度
    //% block="讀取溼度" subcategory="數位型溫溼度感測模組"
    export function readHumidity(): number {
        return bm25.readHumidity();
    }

    //----------------------------------------------------------
    // 環境光感測器
    //---------------------------------------------------------- 
    const I2C_ADDR = 0x48;  // 固定 I2C 位址
    let intPin = DigitalPin.P2;

    //% block="初始化環境光感測器" subcategory="環境光感測器"
    //% weight=100
    export function OLED_init(): void {
        pins.i2cWriteNumber(I2C_ADDR, 0x01, NumberFormat.UInt8LE, false);
        basic.pause(500);
    }

    //% block="讀取 Lux 環境光強度 (ID %sensorID)" subcategory="環境光感測器"
    //% sensorID.defl=1
    export function readLux(sensorID: number): number {
        let buf = pins.createBuffer(5);
        buf.setNumber(NumberFormat.UInt8LE, 0, I2C_ADDR); // MODULE_MID 固定
        buf.setNumber(NumberFormat.UInt8LE, 1, sensorID); // 指定模組 ID
        buf.setNumber(NumberFormat.UInt8LE, 2, 0x02); // LEN (資料長度)
        buf.setNumber(NumberFormat.UInt8LE, 3, 0x0A); // 命令: 讀取 Lux
        buf.setNumber(NumberFormat.UInt8LE, 4, (I2C_ADDR + sensorID + 0x02 + 0x0A) & 0xFF); // Checksum

        pins.i2cWriteBuffer(I2C_ADDR, buf, false);
        basic.pause(15);

        let response = pins.i2cReadBuffer(I2C_ADDR, 7, false);
        if (response.getNumber(NumberFormat.UInt8LE, 3) != 0) {
            return 0; // 讀取失敗回傳 0
        }

        let rawData = response.getNumber(NumberFormat.UInt16LE, 4); // Lux 資料
        return rawData * 0.0036; // 轉換為 Lux
    }

    //----------------------------------------------------------
    // CO2感測器
    //---------------------------------------------------------- 
    const HEADER_BYTE = 0xFF;
    const DEVICE_ADDRESS = 0x01;
    const CMD_READ_GAS = 0x86;
    const CMD_SET_CONCENTRATION_RANGE = 0x99;
    const CMD_ZERO_CALIBRATE = 0x87;
    const SERIAL_BAUDRATE = 9600;

    let CO2_isInitialized = false;
    let maxConcentrationRange = 5000; // 預設量程為 400-5000ppm
    /**
     * 初始化 CO2 感測器
     * @param rxPin 接收腳位, eg: SerialPin.P0
     * @param txPin 發送腳位, eg: SerialPin.P1
     * @param range 測量範圍, eg: GasConcentrationRange.Range5000
     */
    //% block="初始化 CO2 感測器 通道 $uartChannel 範圍 $range" subcategory="CO2感測器"
    //% weight=100
    export function initialize(uartChannel: UARTChannel, range: GasConcentrationRange = GasConcentrationRange.Range5000): void {
        let rxPin: SerialPin;
        let txPin: SerialPin;

        // 根據選擇的 UART 通道設置對應的 RX 和 TX 腳位
        if (uartChannel == UARTChannel.UART1) {
            rxPin = SerialPin.P1; // UART1 RX
            txPin = SerialPin.P0; // UART1 TX
        } else if (uartChannel == UARTChannel.UART2) {
            rxPin = SerialPin.P13; // UART2 RX
            txPin = SerialPin.P12; // UART2 TX
        } else if (uartChannel == UARTChannel.UART3) {
            rxPin = SerialPin.P16; // UART3 RX
            txPin = SerialPin.P15; // UART3 TX
        }

        // 設定串口
        serial.redirect(txPin, rxPin, SERIAL_BAUDRATE);
        serial.setRxBufferSize(64);
        serial.setTxBufferSize(64);

        // 清空緩衝區
        serial.readString();

        // 設置最大量程
        maxConcentrationRange = range;
        setConcentrationRange(maxConcentrationRange);

        // 等待模組初始化
        basic.pause(1000);

        isInitialized = true;
        basic.showIcon(IconNames.Yes);
    }
    /**
     * 預熱 CO2 感測器 (60秒)
     */
    //% block="預熱 CO2 感測器" subcategory="CO2感測器"
    //% weight=90
    export function warmUp(): void {
        if (!isInitialized) {
            basic.showIcon(IconNames.No);
            return;
        }

        basic.showString("wait");
        for (let i = 8; i > 0; i--) {
            basic.pause(1000);
        }
        basic.showIcon(IconNames.Yes);
    }
    
    //----------------------------------------------------------
    // PM2.5感測器
    //----------------------------------------------------------
    let _initialized = false
    let _txPin = SerialPin.P0
    let _rxPin = SerialPin.P1
    let _pwmPin = AnalogPin.P2
    let _pm25_pwm_lastReading = 0
    let _pm25_uart_lastReading = 0


    //% blockId="BM25S3221_begin_uart_1" 
    //% block="初始化 PM2.5感測器 通道 %uart| PWM 接腳 %pwm"
    //% uart.fieldEditor="gridpicker" uart.fieldOptions.columns=3
    //% pwm.fieldEditor="gridpicker" pwm.fieldOptions.columns=4
    //% subcategory="PM2.5感測器"
    //% weight=98
    export function PM_begin(uart: UARTChannel, pwm: AnalogPin): void {
        _pwmPin = pwm

        if (uart == UARTChannel.UART1) {
            _rxPin = SerialPin.P1
            _txPin = SerialPin.P0
        } else if (uart == UARTChannel.UART2) {
            _rxPin = SerialPin.P12
            _txPin = SerialPin.P13
        } else if (uart == UARTChannel.UART3) {
            _rxPin = SerialPin.P16
            _txPin = SerialPin.P15
        }

        serial.redirect(_txPin, _rxPin, BaudRate.BaudRate9600)
        basic.pause(2000)
        serial.readString()
        _initialized = true
    }

    //% blockId="BM25S3221_readPM25_pwm_1" block="透過PWM讀取PM2.5濃度"
    //% subcategory="PM2.5感測器"
    //% weight=90
    export function readPM25byPWM(): number {
        // 對應 BM25S3221_1::readPM25Value() in .cpp
        let th = pins.pulseIn(_pwmPin, PulseValue.High, 2000000)

        if (th < 200) return _pm25_pwm_lastReading

        let pm25Val = Math.floor(th / 1000) // 將 μs 轉換為 μg/m3（對應 C++ 除以 1000）
        _pm25_pwm_lastReading = pm25Val
        return pm25Val
    }
    
    
    
    /**
     * 讀取 CO2 濃度值
     */
    //% block="讀取 CO2 濃度 (ppm)" subcategory="CO2感測器"
    //% weight=80
    export function getGasConcentration(): number {
        if (!isInitialized) {
            basic.showIcon(IconNames.No);
            return 0;
        }

        // 清空接收緩衝區
        serial.readString();

        // 構建命令
        let cmdBuffer = pins.createBuffer(9);
        cmdBuffer[0] = HEADER_BYTE;
        cmdBuffer[1] = DEVICE_ADDRESS;
        cmdBuffer[2] = CMD_READ_GAS;
        cmdBuffer[3] = 0x00;
        cmdBuffer[4] = 0x00;
        cmdBuffer[5] = 0x00;
        cmdBuffer[6] = 0x00;
        cmdBuffer[7] = 0x00;
        cmdBuffer[8] = CO2_calculateChecksum(cmdBuffer);

        // 發送命令
        serial.writeBuffer(cmdBuffer);

        // 等待回應
        basic.pause(100);

        // 讀取回應
        let responseBuffer = serial.readBuffer(9);

        // 檢查回應有效性
        if (responseBuffer.length < 9 || responseBuffer[0] != HEADER_BYTE || responseBuffer[1] != CMD_READ_GAS) {
            return -1; // 無效回應
        }

        // 解析 CO2 濃度值
        let gasConcentration = (responseBuffer[2] << 8) | responseBuffer[3];
        return gasConcentration;
    }
    /**
     * 校準零點 (400ppm)
     * 注意: 需要在乾淨的空氣環境中進行
     */
    //% block="校準零點 (400ppm)" subcategory="CO2感測器"
    //% weight=70
    export function calibrateToZero(): void {
        if (!isInitialized) {
            basic.showIcon(IconNames.No);
            return;
        }

        // 構建命令
        let cmdBuffer = pins.createBuffer(9);
        cmdBuffer[0] = HEADER_BYTE;
        cmdBuffer[1] = DEVICE_ADDRESS;
        cmdBuffer[2] = CMD_ZERO_CALIBRATE;
        cmdBuffer[3] = 0x00;
        cmdBuffer[4] = 0x00;
        cmdBuffer[5] = 0x00;
        cmdBuffer[6] = 0x00;
        cmdBuffer[7] = 0x00;
        cmdBuffer[8] = CO2_calculateChecksum(cmdBuffer);

        // 發送命令
        serial.writeBuffer(cmdBuffer);

        // 等待校準完成
        basic.pause(1000);
        basic.showIcon(IconNames.Yes);
    }
    /**
     * 設置測量範圍的最大值
     * @param value 最大值 (400-5000ppm)
     */
    function setConcentrationRange(value: number): void {
        // 構建命令
        let cmdBuffer = pins.createBuffer(9);
        cmdBuffer[0] = HEADER_BYTE;
        cmdBuffer[1] = DEVICE_ADDRESS;
        cmdBuffer[2] = CMD_SET_CONCENTRATION_RANGE;
        cmdBuffer[3] = 0x00;
        cmdBuffer[4] = 0x00;
        cmdBuffer[5] = 0x00;
        cmdBuffer[6] = (value >> 8) & 0xFF;
        cmdBuffer[7] = value & 0xFF;
        cmdBuffer[8] = CO2_calculateChecksum(cmdBuffer);

        // 發送命令
        serial.writeBuffer(cmdBuffer);

        // 等待設置完成
        basic.pause(100);
    }
    /**
     * 計算校驗和
     */
    function CO2_calculateChecksum(buffer: Buffer): number {
        let checksumSum = 0;
        for (let i = 1; i < 8; i++) {
            checksumSum += buffer[i];
        }
        return (~checksumSum + 1) & 0xFF;
    }


    //----------------------------------------------------------
    // 4key
    //---------------------------------------------------------- 
    // 定義大標題「元件1」，用於整合BMK52M134的功能
    //% block="元件1 (4KEY)"
    export namespace 元件1 {

        // 常數定義
        const MODULE_MID = 0x56
        const DEFAULT_I2C_ADDR = 0x71
        const BROADCAST_ID = 0x00

        // 命令碼定義
        const CMD_CHECK_MODULE = 0x01  // 獲取模組數量
        const CMD_KEY_SCAN = 0x02      // 按鍵掃描
        const CMD_SET_THR = 0x03       // 設定閾值
        const CMD_GET_THR = 0x04       // 獲取閾值
        const CMD_SET_SLEEPEN = 0x05   // 設定休眠
        const CMD_GET_SLEEPEN = 0x06   // 獲取休眠狀態

        let initialized = false
        let intPin: DigitalPin
        let moduleCount = 1

        /**
         * 按鍵編號
         */
        export enum KeyNumber {
            //% block="按鍵1"
            KEY1 = 0x01,
            //% block="按鍵2"
            KEY2 = 0x02,
            //% block="按鍵3"
            KEY3 = 0x04,
            //% block="按鍵4"
            KEY4 = 0x08
        }

        /**
         * 休眠模式設定
         */
        export enum SleepMode {
            //% block="停用"
            DISABLE = 0x00,
            //% block="啟用"
            ENABLE = 0x01
        }

        /**
         * 初始化BMK52M134
         */
        //% block="初始化觸控模組|INT接腳 %pin"
        //% subcategory="4key 觸控模組"
        //% weight=100
        export function init(pin: DigitalPin): void {
            intPin = pin
            pins.setPull(intPin, PinPullMode.PullUp)

            // 設定I2C通訊
            pins.i2cWriteNumber(DEFAULT_I2C_ADDR, 0x00, NumberFormat.Int8LE)
            basic.pause(500)

            // 獲取模組數量
            moduleCount = getModuleCount()
            // 設定預設觸發閾值
            setThreshold(16)

            initialized = true
        }

        /**
         * 獲取模組數量
         */
        //% block="獲取模組數量"
        //% subcategory="4key 觸控模組"
        //% weight=90
        export function getModuleCount(): number {
            let buf = pins.createBuffer(5)
            buf[0] = MODULE_MID
            buf[1] = BROADCAST_ID
            buf[2] = 0x02
            buf[3] = CMD_CHECK_MODULE
            buf[4] = MODULE_MID + BROADCAST_ID + 0x02 + CMD_CHECK_MODULE

            pins.i2cWriteBuffer(DEFAULT_I2C_ADDR, buf)
            basic.pause(20)

            let rxBuf = pins.i2cReadBuffer(DEFAULT_I2C_ADDR, 6)
            return rxBuf[4]
        }

        /**
         * 設定觸發閾值
         */
        //% block="設定觸發閾值 %threshold"
        //% threshold.min=10 threshold.max=64
        //% subcategory="4key 觸控模組"
        //% weight=85
        export function setThreshold(threshold: number): void {
            if (!initialized) return

            let buf = pins.createBuffer(6)
            buf[0] = MODULE_MID
            buf[1] = BROADCAST_ID
            buf[2] = 0x03
            buf[3] = CMD_SET_THR
            buf[4] = threshold
            buf[5] = MODULE_MID + BROADCAST_ID + 0x03 + CMD_SET_THR + threshold

            pins.i2cWriteBuffer(DEFAULT_I2C_ADDR, buf)
            basic.pause(20)
        }

        /**
         * 設定休眠模式
         */
        //% block="設定休眠模式 %mode"
        //% subcategory="4key 觸控模組"
        //% weight=80
        export function setSleepMode(mode: SleepMode): void {
            if (!initialized) return

            let buf = pins.createBuffer(6)
            buf[0] = MODULE_MID
            buf[1] = BROADCAST_ID
            buf[2] = 0x03
            buf[3] = CMD_SET_SLEEPEN
            buf[4] = mode
            buf[5] = MODULE_MID + BROADCAST_ID + 0x03 + CMD_SET_SLEEPEN + mode

            pins.i2cWriteBuffer(DEFAULT_I2C_ADDR, buf)
            basic.pause(20)
        }

        /**
         * 讀取按鍵狀態
         */
        //% block="讀取按鍵狀態"
        //% subcategory="4key 觸控模組"
        //% weight=75
        export function getKeyValue(): number {
            if (!initialized) return 0

            let buf = pins.createBuffer(5)
            buf[0] = MODULE_MID
            buf[1] = BROADCAST_ID
            buf[2] = 0x02
            buf[3] = CMD_KEY_SCAN
            buf[4] = MODULE_MID + BROADCAST_ID + 0x02 + CMD_KEY_SCAN

            pins.i2cWriteBuffer(DEFAULT_I2C_ADDR, buf)
            basic.pause(20)

            let rxBuf = pins.i2cReadBuffer(DEFAULT_I2C_ADDR, 5 + moduleCount)
            return rxBuf[4]  // 返回第一個模組的按鍵值
        }

        /**
         * 指定按鍵是否被按下
         */
        //% block="%key 被按下"
        //% subcategory="4key 觸控模組"
        //% weight=70
        export function isKeyPressed(key: KeyNumber): boolean {
            let keyValue = getKeyValue()
            return (keyValue & key) !== 0
        }
    }
    //----------------------------------------------------------
    // 0.96吋OLED顯示模組
    //----------------------------------------------------------
    let font: Buffer;
    let _screen: Buffer = pins.createBuffer(128 * 64 / 8);
    const _I2CAddr = 0x3C; // I2C 地址

    const SSD1306_SETCONTRAST = 0x81;
    const SSD1306_SETCOLUMNADRESS = 0x21;
    const SSD1306_SETPAGEADRESS = 0x22;
    const SSD1306_DISPLAYALLON_RESUME = 0xA4;
    const SSD1306_DISPLAYALLON = 0xA5;
    const SSD1306_NORMALDISPLAY = 0xA6;
    const SSD1306_INVERTDISPLAY = 0xA7;
    const SSD1306_DISPLAYOFF = 0xAE;
    const SSD1306_DISPLAYON = 0xAF;
    const SSD1306_SETDISPLAYOFFSET = 0xD3;
    const SSD1306_SETCOMPINS = 0xDA;
    const SSD1306_SETVCOMDETECT = 0xDB;
    const SSD1306_SETDISPLAYCLOCKDIV = 0xD5;
    const SSD1306_SETPRECHARGE = 0xD9;
    const SSD1306_SETMULTIPLEX = 0xA8;
    const SSD1306_SETLOWCOLUMN = 0x00;
    const SSD1306_SETHIGHCOLUMN = 0x10;
    const SSD1306_SETSTARTLINE = 0x40;
    const SSD1306_MEMORYMODE = 0x20;
    const SSD1306_COMSCANINC = 0xC0;
    const SSD1306_COMSCANDEC = 0xC8;
    const SSD1306_SEGREMAP = 0xA0;
    const SSD1306_CHARGEPUMP = 0x8D;
    const chipAdress = 0x3C;
    const xOffset = 0;
    const yOffset = 0;
    let charX = 0;
    let charY = 0;
    let displayWidth = 128;
    let displayHeight = 64 / 8;
    let screenSize = 0;
    let loadStarted: boolean;
    let loadPercent: number;
    let _ZOOM = 1; // 放大比例設定
    let _ZOOM_X = 2; // 文字寬度放大倍率（只影響寬度，不放大高度）

    function command(cmd: number) {
        let buf = pins.createBuffer(2);
        buf[0] = 0x00;
        buf[1] = cmd;
        pins.i2cWriteBuffer(chipAdress, buf, false);
    }

    command(0xd6); // 設置放大指令
    command(_ZOOM);

    //% block="清除畫面"
    //%subcategory="0.96吋OLED顯示模組"
    //% weight=3
    export function clear() {
        loadStarted = false;
        loadPercent = 0;
        command(SSD1306_SETCOLUMNADRESS);
        command(0x00);
        command(displayWidth - 1);
        command(SSD1306_SETPAGEADRESS);
        command(0x00);
        command(displayHeight - 1);
        let data = pins.createBuffer(17);
        data[0] = 0x40; // Data Mode
        for (let i = 1; i < 17; i++) {
            data[i] = 0x00;
        }
        // send display buffer in 16 byte chunks
        for (let i = 0; i < screenSize; i += 16) {
            pins.i2cWriteBuffer(chipAdress, data, false);
        }
        charX = xOffset;
        charY = yOffset;
    }

    //% block="顯示文字(無換行) $str"
    //%subcategory="0.96吋OLED顯示模組"
    //% weight=6
    export function writeString(str: string) {
        for (let i = 0; i < str.length; i++) {
            if (charX > displayWidth - (5 * _ZOOM_X)) {
                newLine();
            }
            drawChar(charX, charY, str.charAt(i));
            charX += 5 * _ZOOM_X; // 寬度根據縮放調整
        }
    }


    //% block="顯示數字(無換行) $n"
    //%subcategory="0.96吋OLED顯示模組"
    //% weight=5
    export function writeNum(n: number) {
        let numString = n.toString();
        writeString(numString);
    }

    //% block="顯示文字 $str"
    //%subcategory="0.96吋OLED顯示模組"
    //% weight=8
    export function writeStringNewLine(str: string) {
        writeString(str);
        newLine();
    }

    //% block="顯示數字 $n"
    //%subcategory="0.96吋OLED顯示模組"
    //% weight=7
    export function writeNumNewLine(n: number) {
        writeNum(n);
        newLine();
    }

    //% block="加入新的一行"
    //%subcategory="0.96吋OLED顯示模組"
    //% weight=4
    export function newLine() {
        charY++;
        charX = xOffset;
    }

    function drawChar(x: number, y: number, c: string) {
        command(SSD1306_SETCOLUMNADRESS);
        command(x);
        command(x + 5 * _ZOOM_X);
        command(SSD1306_SETPAGEADRESS);
        command(y);
        command(y);

        let line = pins.createBuffer(1 + 5 * _ZOOM_X);
        line[0] = 0x40;

        for (let i = 0; i < 5; i++) {
            let charIndex = c.charCodeAt(0);
            let data = font.getNumber(NumberFormat.UInt8BE, 5 * charIndex + i); // 取得原始字元資料
            for (let z = 0; z < _ZOOM_X; z++) {
                line[1 + i * _ZOOM_X + z] = data; // 重複寫入相同資料 -> 橫向放大
            }
        }

        pins.i2cWriteBuffer(chipAdress, line, false);
    }

    //% block="初始化 OLED 寬 $width 高 $height"
    //% width.defl=128
    //% height.defl=64
    //%subcategory="0.96吋OLED顯示模組"
    //% weight=9
    export function init(width: number, height: number) {
        command(SSD1306_DISPLAYOFF);
        command(SSD1306_SETDISPLAYCLOCKDIV);
        command(0x80);                                  // the suggested ratio 0x80
        command(SSD1306_SETMULTIPLEX);
        command(0x3F);
        command(SSD1306_SETDISPLAYOFFSET);
        command(0x0);                                   // no offset
        command(SSD1306_SETSTARTLINE | 0x0);            // line #0
        command(SSD1306_CHARGEPUMP);
        command(0x14);
        command(SSD1306_MEMORYMODE);
        command(0x00);                                  // 0x0 act like ks0108
        command(SSD1306_SEGREMAP | 0x1);
        command(SSD1306_COMSCANDEC);
        command(SSD1306_SETCOMPINS);
        command(0x12);
        command(SSD1306_SETCONTRAST);
        command(0xCF);
        command(SSD1306_SETPRECHARGE);
        command(0xF1);
        command(SSD1306_SETVCOMDETECT);
        command(0x40);
        command(SSD1306_DISPLAYALLON_RESUME);
        command(SSD1306_NORMALDISPLAY);
        command(SSD1306_DISPLAYON);
        displayWidth = width
        displayHeight = height / 8
        screenSize = displayWidth * displayHeight
        charX = xOffset
        charY = yOffset
        font = hex`
    0000000000
    3E5B4F5B3E
    3E6B4F6B3E
    1C3E7C3E1C
    183C7E3C18
    1C577D571C
    1C5E7F5E1C
    00183C1800
    FFE7C3E7FF
    0018241800
    FFE7DBE7FF
    30483A060E
    2629792926
    407F050507
    407F05253F
    5A3CE73C5A
    7F3E1C1C08
    081C1C3E7F
    14227F2214
    5F5F005F5F
    06097F017F
    006689956A
    6060606060
    94A2FFA294
    08047E0408
    10207E2010
    08082A1C08
    081C2A0808
    1E10101010
    0C1E0C1E0C
    30383E3830
    060E3E0E06
    0000000000
    00005F0000
    0007000700
    147F147F14
    242A7F2A12
    2313086462
    3649562050
    0008070300
    001C224100
    0041221C00
    2A1C7F1C2A
    08083E0808
    0080703000
    0808080808
    0000606000
    2010080402
    3E5149453E
    00427F4000
    7249494946
    2141494D33
    1814127F10
    2745454539
    3C4A494931
    4121110907
    3649494936
    464949291E
    0000140000
    0040340000
    0008142241
    1414141414
    0041221408
    0201590906
    3E415D594E
    7C1211127C
    7F49494936
    3E41414122
    7F4141413E
    7F49494941
    7F09090901
    3E41415173
    7F0808087F
    00417F4100
    2040413F01
    7F08142241
    7F40404040
    7F021C027F
    7F0408107F
    3E4141413E
    7F09090906
    3E4151215E
    7F09192946
    2649494932
    03017F0103
    3F4040403F
    1F2040201F
    3F4038403F
    6314081463
    0304780403
    6159494D43
    007F414141
    0204081020
    004141417F
    0402010204
    4040404040
    0003070800
    2054547840
    7F28444438
    3844444428
    384444287F
    3854545418
    00087E0902
    18A4A49C78
    7F08040478
    00447D4000
    2040403D00
    7F10284400
    00417F4000
    7C04780478
    7C08040478
    3844444438
    FC18242418
    18242418FC
    7C08040408
    4854545424
    04043F4424
    3C4040207C
    1C2040201C
    3C4030403C
    4428102844
    4C9090907C
    4464544C44
    0008364100
    0000770000
    0041360800
    0201020402
    3C2623263C
    1EA1A16112
    3A4040207A
    3854545559
    2155557941
    2154547841
    2155547840
    2054557940
    0C1E527212
    3955555559
    3954545459
    3955545458
    0000457C41
    0002457D42
    0001457C40
    F0292429F0
    F0282528F0
    7C54554500
    2054547C54
    7C0A097F49
    3249494932
    3248484832
    324A484830
    3A4141217A
    3A42402078
    009DA0A07D
    3944444439
    3D4040403D
    3C24FF2424
    487E494366
    2B2FFC2F2B
    FF0929F620
    C0887E0903
    2054547941
    0000447D41
    3048484A32
    384040227A
    007A0A0A72
    7D0D19317D
    2629292F28
    2629292926
    30484D4020
    3808080808
    0808080838
    2F10C8ACBA
    2F102834FA
    00007B0000
    08142A1422
    22142A1408
    AA005500AA
    AA55AA55AA
    000000FF00
    101010FF00
    141414FF00
    1010FF00FF
    1010F010F0
    141414FC00
    1414F700FF
    0000FF00FF
    1414F404FC
    141417101F
    10101F101F
    1414141F00
    101010F000
    0000001F10
    1010101F10
    101010F010
    000000FF10
    1010101010
    101010FF10
    000000FF14
    0000FF00FF
    00001F1017
    0000FC04F4
    1414171017
    1414F404F4
    0000FF00F7
    1414141414
    1414F700F7
    1414141714
    10101F101F
    141414F414
    1010F010F0
    00001F101F
    0000001F14
    000000FC14
    0000F010F0
    1010FF10FF
    141414FF14
    1010101F00
    000000F010
    FFFFFFFFFF
    F0F0F0F0F0
    FFFFFF0000
    000000FFFF
    0F0F0F0F0F
    3844443844
    7C2A2A3E14
    7E02020606
    027E027E02
    6355494163
    3844443C04
    407E201E20
    06027E0202
    99A5E7A599
    1C2A492A1C
    4C7201724C
    304A4D4D30
    3048784830
    BC625A463D
    3E49494900
    7E0101017E
    2A2A2A2A2A
    44445F4444
    40514A4440
    40444A5140
    0000FF0103
    E080FF0000
    08086B6B08
    3612362436
    060F090F06
    0000181800
    0000101000
    3040FF0101
    001F01011E
    00191D1712
    003C3C3C3C
    0000000000`
        loadStarted = false
        loadPercent = 0
        clear()
    }
}