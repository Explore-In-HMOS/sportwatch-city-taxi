import storageUtil from '../utils/storageUtils.js';
import router from '@ohos.router';
import { Builder, Message, P2pClient } from '../wearengine/wearengine';
import { PHONE_APP_FINGERPRINT, PHONE_APP_PACKAGE_NAME } from '../../common/constants';
import brightness from '@system.brightness';
import vibrator from '@system.vibrator';

export default {
    data: {
        mockTaxiCalls: [
            {
                travelId: '0',
                address: '5th Avenue, New York, NY',
                time: '2026-01-13 09:30',
                day: 'Friday',
                driver: 'Adam',
                totalAmount: '23.20$',
                plaka: '34 ABC 123',
                telNo: '123-456-7890'
            },
            {
                travelId: '1',
                address: 'Beyoglu, Istanbul, Turkey',
                time: '2026-01-13 14:15',
                day: 'Friday',
                driver: 'Micheal',
                totalAmount: '30.20$',
                plaka: '42 XYZ 456',
                telNo: '234-567-8901'
            },
            {
                travelId: '2',
                address: 'Champs-Élysées, Paris, France',
                time: '2026-01-14 08:00',
                day: 'Saturday',
                driver: 'Oguz',
                totalAmount: '18.60$',
                plaka: '55 FGH 789',
                telNo: '345-678-9012'
            },
            {
                travelId: '3',
                address: 'Oxford Street, London, UK',
                time: '2026-01-14 12:45',
                day: 'Saturday',
                driver: 'Nico',
                totalAmount: '27$',
                plaka: '63JKL234',
                telNo: '456-789-0123'
            },
            {
                travelId: '4',
                address: 'Kurfürstendamm, Berlin, Germany',
                time: '2026-01-14 17:20',
                day: 'Saturday',
                driver: 'Jack',
                totalAmount: '22$',
                plaka: '78 MNO 567',
                telNo: '567-890-1234'
            },
            {
                travelId: '5',
                address: 'Shibuya, Tokyo, Japan',
                time: '2026-01-15 10:15',
                day: 'Sunday',
                driver: 'Laura',
                totalAmount: '40$',
                plaka: '12 PQR 890',
                telNo: '678-901-2345'
            },
            {
                travelId: '6',
                address: 'Bondi Beach, Sydney, Australia',
                time: '2026-01-15 15:30',
                day: 'Sunday',
                driver: 'Omer',
                totalAmount: '50$',
                plaka: '23 STU 456',
                telNo: '789-012-3456'
            },
            {
                travelId: '7',
                address: 'Rambla, Barcelona, Spain',
                time: '2026-01-16 18:00',
                day: 'Monday',
                driver: 'Selin',
                totalAmount: '33.80$',
                plaka: '34 VWX 678',
                telNo: '890-123-4567'
            },
            {
                travelId: '8',
                address: 'Times Square, New York, NY',
                time: '2026-01-17 10:45',
                day: 'Tuesday',
                driver: 'James',
                totalAmount: '35$',
                plaka: '99 XYZ 123',
                telNo: '123-987-6543'
            },
            {
                travelId: '9',
                address: 'Taksim, Istanbul, Turkey',
                time: '2026-01-17 14:00',
                day: 'Tuesday',
                driver: 'Ali',
                totalAmount: '28.20$',
                plaka: '11 ABX 456',
                telNo: '234-876-5432'
            },
            {
                travelId: '10',
                address: 'Piazza del Duomo, Milan, Italy',
                time: '2026-01-18 09:15',
                day: 'Wednesday',
                driver: 'Luca',
                totalAmount: '40$',
                plaka: '88 MNO 345',
                telNo: '345-654-4321'
            },
            {
                travelId: '11',
                address: 'Rodeo Drive, Los Angeles, CA',
                time: '2026-01-18 13:30',
                day: 'Wednesday',
                driver: 'Sophia',
                totalAmount: '50$',
                plaka: '77 ABC 678',
                telNo: '456-543-3210'
            },
            {
                travelId: '12',
                address: 'Collins Street, Melbourne, Australia',
                time: '2026-01-19 16:45',
                day: 'Thursday',
                driver: 'Jack',
                totalAmount: '38$',
                plaka: '66 XYZ 123',
                telNo: '567-654-2109'
            }
        ],
        title: '',
        selectedTrip: '',
        selectedTripData: null,
        infoMessage: '',
        index: 0,
        infos: ['1', '2'],
        dotIndex: 0,
        location: '',
        geolocationGetData: {
            latitude: '',
            longitude: '',
            altitude: '',
            accuracy: ''
        },
        p2pClient: undefined,
        builderClient: undefined,
        remainingTime: 0,
        remainingDistance: 0,
        timerId: null
    },
    onInit() {
        storageUtil.createNewDirectory();
        storageUtil.saveDataInChunks('taxi_data', this.mockTaxiCalls);
        storageUtil.readDataFromChunks('taxi_data', (data) => {
            if (data) {
                this.selectedTripData = data;
            } else {
                console.error('No Data');
            }
        });
        this.selectedTripData = this.mockTaxiCalls;
        this.keepScreenOn();
        this.vibration();
        this.p2pClient = new P2pClient();
        this.p2pClient.setPeerPkgName(PHONE_APP_PACKAGE_NAME);
        this.p2pClient.setPeerFingerPrint(PHONE_APP_FINGERPRINT);
        this.builderClient = new Builder();
        this.registerMessage();

        if (this.selectedTrip !== '') {
            this.remainingTime = 60;
            this.remainingDistance = 12;

            this.timerId = setInterval(() => {
                if (this.remainingTime === 0) {
                    this.vibration();
                    clearInterval(this.timerId);
                    this.selectedTrip = '';
                }

                this.remainingTime -= 1;
                this.remainingDistance = Math.ceil(this.remainingTime / 5);
            }, 1000);
        }
    },
    routeDetails(travelId) {
        this.selectedTrip = travelId;
        router.replace({
            uri: 'pages/tripDetail/tripDetail',
            params: {
                selectedTrip: this.selectedTrip
            }
        });
    },
    change(e) {
        this.dotIndex = e.index;
        this.index = e.index;
    },
    registerMessage() {
        const that = this;
        this.p2pClient.registerReceiver({
            onSuccess: function() {
                console.info('Message receiver registered successfully');
            },
            onFailure: function() {
                console.error('Message receiver registration failed');
            },
            onReceiveMessage: function(data) {
                if (data && !data.isFileType) {
                    console.info(`get message |${data}|`);
                    if (data === 'cancel') {
                        that.vibration();
                        clearInterval(that.timerId);
                        that.selectedTrip = '';
                    } else if (data.split(' ')[0] === 'start') {
                        that.selectedTrip = data.split(' ')[1];
                        that.vibration();

                        that.remainingTime = 60;
                        that.remainingDistance = 12;

                        that.timerId = setInterval(() => {
                            if (that.remainingTime === 0) {
                                that.vibration();
                                clearInterval(that.timerId);
                                that.selectedTrip = '';
                            }

                            that.remainingTime -= 1;
                            that.remainingDistance = Math.ceil(that.remainingTime / 5);
                        }, 1000);
                    } else {
                        console.info('unknown message');
                    }
                }
            }
        });
    },
    unregisterMessage() {
        const that = this;
        this.p2pClient.unregisterReceiver({
            onSuccess: function() {
                that.infoMessage = 'Disconnected';
            }
        });
    },
    keepScreenOn() {
        brightness.setKeepScreenOn({
            keepScreenOn: true,
            success: function() {
                console.info('Screen on success');
            },
            fail: function() {
                console.info('Screen on failed');
            }
        });
        brightness.setValue({
            value: 180,
            success: function() {
                console.info('Brightness set successfully');
            },
            fail: function(data, code) {
                console.error(`Brightness set failed, code: ${code}`);
            }
        });
    },

    vibration() {
        console.info('Vibration is about to start');
        vibrator.vibrate({
            mode: 'short',
            success: function() {
                console.info('Succeed in vibrating');
            },
            fail: function(data, code) {
                console.info(`Failed to vibrate. Data: ${data}, code: ${code}`);
            },
            complete: function() {
                console.info('completed in vibrating');
            }
        });
    },

    sendMessage(msg) {
        console.info('sendMessage');
        try {
            const message = new Message();
            this.builderClient.setDescription(msg);
            message.builder = this.builderClient;
            this.p2pClient.send(message, {});
        } catch (e) {
            console.error(`sendMessage: ${e} | ${JSON.stringify(e)}`);
        }

    },

    cancelTrip() {
        this.sendMessage('cancel');
    },

    startNewTrip() {
        this.sendMessage('startNewTrip');
    }
};