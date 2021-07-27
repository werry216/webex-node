const WebexChatBot = require("node-sparkbot");
const bot = new WebexChatBot();
const SparkClient = require("node-sparky");
const sparky = new SparkClient({ token: process.env.ACCESS_TOKEN });

const SparkAPIWrapper = require("node-sparkclient");
if (!process.env.ACCESS_TOKEN) {
    console.log("Could not start as this bot requires a Webex Teams API access token.");
    console.log("Please add env variable ACCESS_TOKEN on the command line");
    console.log("Example: ");
    console.log("> ACCESS_TOKEN=XXXXXXXXXXXX DEBUG=sparkbot* node helloworld.js");
    process.exit(1);
}
const client = new SparkAPIWrapper(process.env.ACCESS_TOKEN);

bot.onCommand("start", function (command) {
    let person = command.message;
    sparky.roomGet(person.roomId).then((res) => {
        sparky.roomAdd("new", res.teamId).then((result)=>{
            client.createMessage(command.message.roomId, "Hi, I am the Hello World bot !\n\nI just created new room!", { "markdown":true }, function(err, message) {
                if (err) {
                    console.log("WARNING: could not post message to room: " + command.message.roomId);
                    return;
                }
            });
            sparky.teamMembershipsGet({teamId: res.teamId}).then((teamMembers)=>{
                for (const member of teamMembers) {
                    sparky.personGet(member["personId"]).then((personDetail)=>{
                        if (personDetail["status"]==="active") {
                            const MembershipObj = {
                                personEmail: personDetail["emails"][0],
                                roomId: result.id,
                                isModerator: true,
                            };
                            sparky.membershipAdd(MembershipObj)
                                .then(mymembership => {
                                    sparky.messageSend({
                                        roomId: person.roomId,
                                        markdown: `_
                                            id: ${personDetail["id"]},
                                            emails: ${personDetail["emails"]},
                                            phoneNumbers: ${personDetail["phoneNumbers"]},
                                            displayName: ${personDetail["displayName"]},
                                            orgId: ${personDetail["orgId"]},
                                            status: ${personDetail["status"]},
                                            created: ${personDetail["created"]},
                                            type: ${personDetail["type"]},
                                        _`,
                                    });
                                })
                                .catch(err => console.error(err));
                        }
                    });
                }
            });
        });
    });
});
