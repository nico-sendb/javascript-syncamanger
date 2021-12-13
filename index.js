/**
 * SET YOUR SENDBIRD INFORMATION HERE
 */
 const APP_ID = 'YOUR SENDBIRD APP ID';
 var USER_ID = 'YOUR USER ID';
 var ACCESS_TOKEN = null;
 var sb;


/**
 * INIT SENDBIRD AND CONNECT
 */
function initAndConnect(callback) {
    // Init Sendbird
    sb = new SendBird({ appId: APP_ID });
    // Connect to chat
    sb.connect(USER_ID, ACCESS_TOKEN, (user, error) => {
        if (error) {
            callback(null);
        } else {
            callback(user);
        }
    })
}


function initSyncManager(callback) {
    const options = new SendBirdSyncManager.Options();
    options.messageCollectionCapacity = 2000;
    options.messageResendPolicy = 'manual';
    options.maxFailedMessageCountPerChannel = 5;

    SendBirdSyncManager.sendBird = sb;
    SendBirdSyncManager.setup(USER_ID, options)
        .then(() => {
            console.log('At this point, the database is ready.');
            console.log('You may not assume that a connection is established here.');
            callback();
        })
        .catch(error => {
            console.log('SyncManager init failed: ', error);
        });
}



function fetchChannels() {
    const listQuery = sb.GroupChannel.createMyGroupChannelListQuery();
    const collection = new SendBirdSyncManager.ChannelCollection(listQuery);
    const handler = new SendBirdSyncManager.ChannelCollection.CollectionHandler();

    handler.onChannelEvent = (action, channels) => {
        switch (action) {
            case 'insert':
                console.log('Add channels to the view.');
                console.log(channels);
                break;
            case 'update':
                console.log(' Update channels in the view.');
                console.log(channels);
                break;
            case 'move':
                console.log(' Change the position of channels in the view.');
                console.log(channels);
                break;
            case 'remove':
                console.log('Remove channels from the view.');
                console.log(channels);
                break;
            case 'clear':
                console.log('Clear the view.');
                console.log(channels);
                break;
        }
    };
    collection.setCollectionHandler(handler);
    collection.fetch();
}

function getGroupChannels() {
    var listQuery = sb.GroupChannel.createMyGroupChannelListQuery();
    listQuery.includeEmpty = true;
    listQuery.memberStateFilter = 'all';
    listQuery.order = 'latest_last_message';
    listQuery.limit = 15;
    if (listQuery.hasNext) {
        listQuery.next((groupChannels, error) => {
            console.log('You are connected. These are your channels', groupChannels);
        })
    }
}

/**
 * Let's begin...
 */
initAndConnect((user) => {
    console.log('Connected to sendbird', user);
    if (user) {
        getGroupChannels();
    }
    initSyncManager(() => {
        fetchChannels();
    });
})
