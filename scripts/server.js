let express = require("express");
let app = express();
let port = 9000;
let path = require("path");
let { ethers } = require("ethers");

let mongoose = require("mongoose");
const { timeStamp } = require("console");

//setting up mongoDB database 

let pendingCandidatesSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    ethAddress: {
        type: String,
    },
    contact: {
        type: String,
    },
    approval: {
        type: Boolean,
    }
}, { timeStamp: true });

let pendingCandidatesModel = new mongoose.model("Pending Candidates Approval", pendingCandidatesSchema);

mongoose
    .connect("mongodb://127.0.0.1:27017/Secure_Voting_System")
    .then(() => {
        console.log("DataBase connected");
    })
    .catch(() => {
        console.log("Error in connecting DataBase");
    });


app.use("/abi", express.static(path.join(__dirname, "../artifacts/contracts/Voting.sol")));
app.use(express.static(path.join(__dirname, "../views")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.get("/", async (req, res) => {
    res.sendFile("C:\\Users\\nkshu\\OneDrive\\Desktop\\New folder\\views\\index.html");
});

app.get("/home", async (req, res) => {
    res.sendFile("C:\\Users\\nkshu\\OneDrive\\Desktop\\New folder\\views\\home.html");
});
app.get("/register-voter", async (req, res) => {
    res.sendFile("C:\\Users\\nkshu\\OneDrive\\Desktop\\New folder\\views\\register-voter.html");
});
app.get("/candidate-form", async (req, res) => {
    console.log("Candidate form requested");
    res.sendFile("C:\\Users\\nkshu\\OneDrive\\Desktop\\New folder\\views\\candidate-form.html");
});
app.post("/candidatesApproval", async (req, res) => {
    console.log("Candidate approval requested");
    let { candidateName, candidateContact, ethAddress } = req.body;
    if (!candidateName || !ethAddress || !candidateContact) {
        res.end("ERROR 404");
    }
    try {
        await pendingCandidatesModel.create({
            name: candidateName,
            contact: candidateContact,
            ethAddress: ethAddress,
            approval: false
        });
        console.log("Candidate waiting for approval");
    } catch (error) {
        console.log(error);
    }

    res.redirect("/home");
});
app.post("/candidateRejection",async (req,res)=>{
    console.log("Candidate rejection requested");
    let {userAddress} = req.body;
    try {
        let el = await pendingCandidatesModel.findOneAndDelete({
            ethAddress: userAddress
        });
        if(el){
            console.log("Deletion successfull");
        }
    } catch (error) {
        console.log("Error in deleting Candidate");
    }
    res.redirect("/approveCandidate") 
    });

app.get("/candidatesApproval", async (req, res) => {
    console.log("Candidate approval page requested");
    res.sendFile("C:\\Users\\nkshu\\OneDrive\\Desktop\\New folder\\views\\candidatesApproval.html");
});
app.post("/approveCandidate", async (req, res) => {
    console.log("Approving candidate in DataBase");
    let ethAddress = req.body.address;
    console.log(ethAddress);
    try {
        let update = await pendingCandidatesModel.findOneAndUpdate(
            {
                ethAddress: ethAddress
            },
            {
                $set: { approval: true }
            },
            {
                new: true
            });
        res.redirect("/candidatesApproval")
    } catch (error) {
        console.log(error);
    }
});

app.get("/candidatesApprovalList", async (req, res) => {
    console.log("Candidate approval list requested");
    try {
        let candidatesApprovalList = await pendingCandidatesModel.find({ approval: false });
        res.json(candidatesApprovalList);
    } catch (error) {
        res.status(500).
            console.log("Error fetching candidates ", error);
    }
});
app.get("/candidates-list", async (req, res) => {
    console.log("Candidate list requested");
    res.sendFile("C:\\Users\\nkshu\\OneDrive\\Desktop\\New folder\\views\\candidates-list.html");
});
app.get("/admin", async (req, res) => {
    console.log("Admin page requested");
    res.sendFile("C:\\Users\\nkshu\\OneDrive\\Desktop\\New folder\\views\\admin.html");
});
app.get("/vote", async (req, res) => {
    console.log("Voting page requested");
    res.sendFile("C:\\Users\\nkshu\\OneDrive\\Desktop\\New folder\\views\\voting.html");
});
app.get("/winner", async (req, res) => {
    console.log("Voting page requested");
    res.sendFile("C:\\Users\\nkshu\\OneDrive\\Desktop\\New folder\\views\\winner.html");
});

app.listen(port, "0.0.0.0", () => {
    console.log("Server started on port: ", port);
})
