const { Pool } = require('pg');
const pool;


export default class DataLayer {
    
    constructor(databaseConfig){

        // TODO: Setup config file with example config

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
            client.query("INSERT INTO reports(ReportedUser, ReportingUser, IsPraise, Comment) VALUES($1, $2, $3, $4)", 
                [reportingUsername, reportedUsername, false, comment], 
                (err, result) => {
                    release()
                    if(err) {
                        Console.error("SEVERE: Error reporting user")
                        return callback(err, null);
                    }
                    calculateScore(username, _)
                    return callback(null, true)
            })
            release()
        })
    }
    
    // Praise user
    praiseUser(reportingUsername, reportedUsername, comment, callback) {
        pool.connect((err, client, release) => 
        {
            if (err) {
                Console.error("SEVERE: Error getting client from pool")
                return callback(err, null);
            }
            client.query("INSERT INTO reports(ReportedUser, ReportingUser, IsPraise, Comment) VALUES($1, $2, $3, $4)", 
                [reportingUsername, reportedUsername, true, comment], 
                (err, result) => {
                    release()
                    if(err) {
                        Console.error("SEVERE: Error reporting user")
                        return callback(err, null);
                    }
                    calculateScore(username, _)
                    return callback(null, true)
            })
            release()
        })
    }

    // Remove report/praise
    removeReport(reportId, callback) {
        pool.connect((err, client, release) => 
        {
            if (err) {
                Console.error("SEVERE: Error getting client from pool")
                return callback(err, null)
            }
            client.query("DELETE FROM report WHERE id == $1", reportId, (err, result) => {
                release()
                if(err) {
                    Console.error("SEVERE: Error deleting report")
                    return callback(err, null)
                }
                calculateScore(username, _)
                return callback(null, true)
            })
        })
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
                    initUser(username, (err, user) => {
                        if (err) {
                            return callback(err, null)
                        }
                        return callback(null, user.id)
                    })
                }
                return callback(null, result.rows[0].id)
            })
        })
    }

    // This is used locally to update a users score when praised, reported, or if a report is removed
    calculateScore(username, callback)
    {
        pool.connect((err, client, release) => 
        {
            if (err) {
                Console.error("SEVERE: Error getting client from pool")
                return callback(err, null)
            }
            client.query("SELECT * FROM user WHERE username == $1", username, (err, result) => {
                if(err) {
                    release()
                    Console.error("SEVERE: Error retrieving user")
                    return callback(err, null)
                }
                if (result.rows.length == 0) {
                    initUser(username, (err, user) => {
                        if (err) {
                            return callback(err, null)
                        }
                        return callback(null, 500)
                    })
                }
                let user = result.rows[0];
                client.query("SELECT * FROM report WHERE ReportedUser == $1", user.id, (err, result) => {
                    if(err) {
                        release()
                        Console.error("SEVERE: Error user reports to calculate score")
                        return callback(err, null)
                    }
                    let score = 500;
                    foreach(report in result)
                    {
                        if(report.IsPraise)
                        {
                            score += 10;
                        } 
                        else {
                            score -= 10;
                        }
                    }
                    client.query("UPDATE user SET score = $1 WHERE id == $2", [score, user.id], (err, result) => {
                        release()
                        if (err) {
                            Console.error("SEVERE: Error updating users score")
                            return callback(err, null)
                        }
                        return callback(null, score)
                    })
                })
                return callback(null, result.rows[0].id)
            })
        })
    }
}