const { Pool } = require('pg');
const pool;


export default class DataLayer {
    
    constructor(databaseConfig){
        if(!databaseConfig)
        {
            Console.error("No database configuration given. Exiting")
            process.exit(0)
        }
        pool = new Pool(databaseConfig);
        pool.connect((err, client, release) => {
            if (err) {
                Console.error("Error connecting to database", err.stack)
                process.exit(0)
            }
            client.query('SELECT NOW()', (err, result) => {
                release()
                if (err) {
                    console.error("Error executing config query", err.stack)
                    process.exit(0)
                }
                console.log("DataLayer initialized: " + result.rows)
            })
        })
    }

    /*  
    Datatypes:
        User:
            ID:GUID
            Username:string
            Score:int
        Report:
            ReportedUser:(User:GUID)
            ReportingUser:(User:GUID)
            IsPraise:Bool
            Comment:Text
    */

    // Initialize new user
    initUser(username, callback) {
        pool.connect((err, client, release) => 
        {
            if (err) {
                Console.error("SEVERE: Error getting client from pool")
                return callback(err, null);
            }
            client.query("INSERT INTO User(Username, Score) VALUES($1, $2)", [username, 500], (err, result) => {
                release()
                if (err) {
                    Console.error("SEVERE: Error initializing user")
                    return callback(err, null);
                }
                callback(null, result)
            })
        })
    }

    // Get User score
    getUserScore(username, callback) {
        pool.connect((err, client, release) => 
        {
            if (err) {
                Console.error("SEVERE: Error getting client from pool")
                return callback(err, null);
            }
            client.query("SELECT Score FROM user WHERE Username == $1", username, (err, result) => {
                release()
                if(err) {
                    Console.error("SEVERE: Error retrieving user")
                    return callback(err, null);
                }
                if (result.rows.length == 0) {
                    async(initUser(username))
                    return 500
                }
                return result.rows[0].score
            })
        })
    }

    // Get User reports
    getuserReports(username, callback) {
        pool.connect((err, client, release) => 
        {
            if (err) {
                Console.error("SEVERE: Error getting client from pool")
                return callback(err, null);
            }
            client.query("SELECT * FROM reports WHERE username == $1", username, (err, result) => {
                release()
                if(err) {
                    Console.error("SEVERE: Error retrieving user")
                    return callback(err, null);
                }
                if (result.rows.length == 0) {
                    async(initUser(username))
                    callback(null, 500)
                }
                return result.rows[0].score
            })
        })
    }

    // Report user
    reportUser(reportingUsername, reportedUsername, comment, callback) {
        pool.connect((err, client, release) => 
        {
            if (err) {
                Console.error("SEVERE: Error getting client from pool")
                return callback(err, null);
            }
            client.query("SELECT * FROM reports WHERE username == $1", reportingUsername, (err, result) => {
                if(err) {
                    Console.error("SEVERE: Error retrieving reporting user")
                    release()
                    return callback(err, null);
                }
                if (result.rows.length == 0) {
                    initUser(username, (err, newUser) => {
                        if (err) return callback(err, null);;
                        
                    })
                    
                }
                return result.rows[0].score
            })
            release()
        })
    }
    
    // Praise user
    praiseUser(reportingUsername, reportedUsername, comment, callback) {

    }

    // Remove report/praise
    removeReport(reportId, callback) {

    }

    // Get Username ID
    getUserId(username, callback) {
        pool.connect((err, client, release) => 
        {
            if (err) {
                Console.error("SEVERE: Error getting client from pool")
                return callback(err, null)
            }
            client.query("SELECT * FROM user WHERE username == $1", username, (err, result) => {
                release()
                if(err) {
                    Console.error("SEVERE: Error retrieving user")
                    return callback(err, null)
                }
                if (result.rows.length == 0) {
                    var newUser = initUser(username)
                    return callback(null, newUser.id)
                }
                return callback(null, result.rows[0].id)
            })
        })
    }
}