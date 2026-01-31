import storageUtil from '../utils/storageUtils';
import router from '@ohos.router';

export default {
    data: {
        tripDetails: {},
        travelId: '',
        selectedTripData: null,
        selectedTrip: '0'
    },

    onInit() {
        storageUtil.readDataFromChunks('taxi_data', (data) => {
            if (data) {
                this.selectedTripData = data;
            } else {
                console.error('No Data');
            }
        });
    },

    onCallAgain() {
        router.replace({
            uri: 'pages/index/index',
            params: {
                selectedTrip: this.selectedTrip
            }
        });
    }
};