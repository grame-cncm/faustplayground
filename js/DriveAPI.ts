declare var gapi

interface DriveFile {
    id: string
    name: string;
    downloadUrl: string;
    webContentLink: string;
}

class DriveAPI{

    CLIENT_ID: string = '868894976686-v9jemj2h2ejkjhf0tplf6jp4v4vfleju.apps.googleusercontent.com';

    SCOPES: string[] = ['https://www.googleapis.com/auth/drive'];

    /**
     * Check if current user has authorized this application.
     */
    checkAuth() {
        gapi.auth.authorize(
            {
                'client_id': this.CLIENT_ID,
                'scope': this.SCOPES.join(' '),
                'immediate': true
            }, this.handleAuthResult);
    }

    /**
     * Handle response from authorization server.
     *
     * @param {Object} authResult Authorization result.
     */
    handleAuthResult(authResult) {
        var buttonConnect = document.getElementById('buttonConnectDrive');
        if (authResult && !authResult.error) {
            // Hide auth UI, then load client library.
            buttonConnect.style.display = 'none';
            var select = document.getElementById("existingSceneSelectDrive");
            select.style.display = "block";
            this.loadDriveApi();
        } else {
            // Show auth UI, allowing the user to initiate authorization by
            // clicking authorize button.
            buttonConnect.style.display = 'inline';
        }
    }

    /**
     * Initiate auth flow in response to user clicking authorize button.
     *
     * @param {Event} event Button click event.
     */
    handleAuthClick(event) {
        gapi.auth.authorize(
            { client_id: this.CLIENT_ID, scope: this.SCOPES, immediate: false },
            (authResult) => { this.handleAuthResult(authResult) });
        return false;
    }

    /**
     * Load Drive API client library.
     */
    loadDriveApi() {
        gapi.client.load('drive', 'v2', () => { this.listFiles() });
    }

    /**
     * Print files.
     */
    listFiles() {
        var request = gapi.client.drive.files.list({
            'maxResults': 1000
        });

        request.execute( (resp)=> {
            var files = resp.items;
            if (files && files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (file.fileExtension=="json") {
                        this.appendPre(file.title,file.id);
                    }
                }
            } else {
                this.appendPre('No files found.',null);
            }
        });
    }
    findJson(fileName: string): boolean {
        var pattern: RegExp = new RegExp(".json$");
        if (pattern.test(fileName)) {
            return true
        } else {
            return false
        }
    }

    /**
     * Append a pre element to the body containing the given message
     * as its text node.
     *
     * @param {string} message Text to be placed in pre element.
     */
    appendPre(name,id) {
        var option = document.createElement("option");
        option.value = id;
        option.textContent = name;

        var select = <HTMLSelectElement>document.getElementById('existingSceneSelectDrive');
        select.options.add(option)
        
    }
    /**
 * Download a file's content.
 *
 * @param {File} file Drive File instance.
 * @param {Function} callback Function to call when the request is complete.
 */
    downloadFile(file: DriveFile, callback) {
        if (file.downloadUrl) {
            var accessToken = gapi.auth.getToken().access_token;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', file.downloadUrl);
            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            xhr.onload = function () {
                callback(xhr.responseText);
            };
            xhr.onerror = function () {
                callback(null);
            };
            xhr.send();
        } else {
            callback(null);
        }
    }
    /**
 * Print a file's metadata.
 *
 * @param {String} fileId ID of the file to print metadata for.
 */
    getFile(fileId,callback):any {
        var request = gapi.client.drive.files.get({
            'fileId': fileId,

        });
        request.execute((resp) => { callback(resp) })
    }
}