/**
 * This is a file which can be exposed as a library that supports the basic CRD(create, read, write) operations.
 * Data store is meant to local storage for one single process on single laptop.
 */
const fs=require('fs');
const pth=require('path');

const FILE_NAME='fileDB.json';

const store=class Store{
    constructor(path=process.cwd()){
        this.dbPath = path;
        this.data={};
        if (!fs.existsSync(path)) {
            console.log('Filepath does not exists.\nUsing current working directory\n');
            path=process.cwd();
        }
        let full_path=pth.join(path,FILE_NAME);
        if (!fs.existsSync(full_path)) {
            //If no DB detected Creating new One.
            fs.writeFileSync(full_path, JSON.stringify(this.data), (err)=> {
                if (err) {
                    console.log(err)
                } else {
                    console.log(`Creating new database @ ${path}\n`)
                }
            });
            this.dbPath = full_path;

        } else {
            //If existing DB is detected Reading it
            fs.readFileSync(full_path, 'utf8', (error, fileData) => {
                if (error) {
                    rejected(error);
                } else {
                    this.data = JSON.parse(fileData)
                    this.dbPath = full_path;
                    console.log(`Found a database @ ${path}\n`);
                }
            })
        }
    };
    
    //Stops any other client from accessing the database
    // startConnection(){
    //     console.log("Start Connection");
    // };

    // endConnection(){
    //     console.log("End Connection");
    // };

    createKey(key, value, time_to_live=-1){
        this.key = key;
        this.value = value;
        this.time_to_live = time_to_live;

      
        
            if(time_to_live!==-1){
                this.time_to_live = millis + this.time_to_live;
            }
            else{
                this.time_to_live=-1;
            }
            //Checking for DB size limit -- max(1GB)
            if (Buffer.byteLength(JSON.stringify(this.data)) / (1024*1024*1024) > 1) {
                console.log(`Datastore size limit exceding 1GB. Cannot create.\n`);
                return;
            }
            if (key == null) {
                console.log('Key should not be null\n');
            }
            if (typeof key != 'string') {
                console.log('The type of key should be string\n');
                return;
            }
            if (typeof value != 'object') {
                console.log('The type of value should be object\n');
                return;
            } 
            else if (value == null || Object.keys(value).length === 0) {
                console.log('Value should not be null or Empty\n');
                return;
            }
            if (key.length <= 0 || 32 < key.length) {
                console.log('The key should have Max of 32 chars and Min of 1 char.\n');
                return;
            }
            if (Object.keys(this.data).includes(key)) {
                console.log('Key already exists.Key should be unique.');
                return;
            }
            if (Buffer.byteLength(JSON.stringify(value)) / 1024 > 16) {
                console.log(`Value size should not be greater than 16KB.Your value size ${(Buffer.byteLength(JSON.stringify(value))/1024).toFixed(2)}KB`);
                return;
            }

            this.data[key] = {"value":value,"ttl":time_to_live};
            //Writing into DB
            fs.writeFileSync(this.dbPath, JSON.stringify(this.data), (err)=> {
                if (err) {
                    console.log(err);
                }
            });
            let msg = `Space Used : ${(Buffer.byteLength(JSON.stringify(this.data))/1024).toFixed(2)}KB`
            console.log(msg)
    };
    
    
    readKey(key){
        
        if (!Object.keys(this.data).includes(key)) {
            console.log('Key does not exists')
        } else {
            if(this.data[key][ttl]==-1 || this.data[key]["ttl"]<Date.now()){
                return this.data[key]["value"];
            }
            else{
                console.log("Time to live for this key has expired");
            }
        }
    };
    
    deleteKey(key){
        
            //Checking key exists in DB
            if (!Object.keys(this.data).includes(key)) {
                console.log('Key does not exists\n');
            } else {
                if(this.data[key][ttl]==-1 || this.data[key]["ttl"]<Date.now()){
                    delete this.data[key];
                    fs.writeFileSync(this.dbPath, JSON.stringify(this.data), function (err) {
                        if (err) {
                            console.log(err)
                        }
                    });
                }else{
                    console.log("Time to live for this key has expired");
                }
            }

    };
};

module.exports=store;
