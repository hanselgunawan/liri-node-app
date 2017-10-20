const columnify = require("columnify");
const Twitter = require("twitter");
const Spotify = require("spotify-web-api-node");
const request = require("request");
const fs = require("fs");
const keys = require("./keys.js");
const twitter = new Twitter(keys.twitterKeys);
const spotify = new Spotify(keys.spotifyKeys);

function displayMovie(error, response, body)
{
    jsonBody = JSON.parse(body);
    console.log(' ');
    console.log('Title: ' + jsonBody.Title);
    console.log('Year: ' + jsonBody.Year);
    console.log('IMDb Rating: ' + jsonBody.imdbRating);
    console.log('Country: ' + jsonBody.Country);
    console.log('Language: ' + jsonBody.Language);
    console.log('Plot: ' + jsonBody.Plot);
    console.log('Actors: ' + jsonBody.Actors);
    console.log('Rotten Tomatoes Rating: ' + jsonBody.tomatoRating);
    console.log('Rotten Tomatoes URL: ' + jsonBody.tomatoURL);
    console.log(' ');

    let omdb_string = "Title: " + jsonBody.Title + "\n"
                    + "Year: " + jsonBody.Year + "\n"
                    + "IMDb Rating: " + jsonBody.imdbRating + "\n"
                    + "Country: " + jsonBody.Country + "\n"
                    + "Language: " + jsonBody.Language + "\n"
                    + "Plot: " + jsonBody.Plot + "\n"
                    + "Actors: " + jsonBody.Actors + "\n"
                    + "Rotten Tomatoes Rating: " + jsonBody.tomatoRating + "\n"
                    + "Rotten Tomatoes URL: " + jsonBody.tomatoURL + "\n";

    fs.appendFile("omdb-log.txt", "Execution Date/Time: " + Date() + "\n\n" + omdb_string + "\n============================================================\n\n", function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("omdb-log.txt was updated!");
    });
}

//TWITTER
function displayMyTweets()
{
    let params = {
        count: 20
    };

    twitter.get('statuses/user_timeline', params, function(error, tweets, response) {
        if(error) throw error;
        var data = [];

        //create an object within the For Loops
        for(let i in tweets)
        {
            data.push({
                tweet: tweets[i].text,
                date: tweets[i].created_at
            });
        }

        let columns = columnify(data, {
            columns: ['tweet', 'date']
        });

        console.log(columns);

        fs.appendFile("tweet-log.txt", "Execution Date/Time: " + Date() + "\n\n" + columns + "\n============================================================\n\n", function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("tweet-log.txt was updated!");
        });
    });
}

//SPOTIFY
function displaySpotify(track_title)
{
    spotify.clientCredentialsGrant()
        .then(function(data) {
            //console.log('The access token expires in ' + data.body['expires_in']);
            //console.log('The access token is ' + data.body['access_token']);
            let flag = 0;//to check if track_title is undefined or not
            if(track_title === undefined)
            {
                track_title = "Ace of Base";
                flag = 1;
            }
            // Save the access token for future calls
            spotify.setAccessToken(data.body['access_token']);

            spotify.searchTracks(track_title)
                .then(function(data) {
                    let trackArray = [];
                    let limit = data.body.tracks.limit;
                    if(flag === 1) limit = 1;//can't use track_title === undefined because its already changed to Ace of Base
                    for(let i=0;i<limit;i++)
                    {
                        trackArray.push({
                            artist: data.body.tracks.items[i].album.artists[0].name,
                            title: data.body.tracks.items[i].name,
                            link: data.body.tracks.items[i].external_urls.spotify,
                            album: data.body.tracks.items[i].album.name
                        });
                    }

                    let columns = columnify(trackArray, {
                        columns: ['artist', 'title', 'link', 'album']
                    });

                    console.log(columns);

                    fs.appendFile("spotify-log.txt", "Execution Date/Time: " + Date() + "\n\n" + columns + "\n\n\n", function(err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("spotify-log.txt was updated!");
                        }
                    });
                }, function(err) {
                    console.error(err);
                });
        }, function(err) {
            console.log('Something went wrong when retrieving an access token', err);
        });
}

//OMDB
function displayOMDB(movie_title)
{
    request('http://www.omdbapi.com/?apikey=40e9cece&t=' + movie_title + '&tomatoes=true&r=json', displayMovie);
}

//Do What It Says
function doWhatItSays()
{
    fs.readFile("random.txt", "utf8", function(error, data) {
        if (error) {
            return console.log(error);
        }

        let dataArr = data.split(",");
        //console.log(dataArr);

        if(dataArr[0] === "Spotify-this-song")
        {
            displaySpotify(dataArr[1]);
        }
        else
        {
            console.log("Wrong command!");
        }
    });
}

let user_command = process.argv[2];

switch (user_command)
{
    case "my-tweets":
        displayMyTweets();
        break;
    case "spotify-this-song":
        let track_title = process.argv[3];
        displaySpotify(track_title);
        break;
    case "movie-this":
        let movie_title = process.argv[3];
        if(movie_title === undefined) movie_title = "Mr Nobody";
        displayOMDB(movie_title);
        break;
    case "do-what-it-says":
        doWhatItSays();
        break;
    default:
        console.log("No command found.");
        break;
}