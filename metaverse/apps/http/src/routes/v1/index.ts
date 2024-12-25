import { Router } from "express";
import { userRouter } from "./user";
import { authRouter } from "./auth";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";
import client from "@repo/db/client"
import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

export const router = Router();

// Email transport setup (using Gmail as an example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN
  }
});

const checkUserByEmail = async (email:string) => {
  try {
    const user = await client.user.findUnique({
      where: { email },
    });
    return user ? true : false;
  } catch (error) {
    console.error('Error checking user:', error);
    throw error;
  }
};


router.post("/send-otp", async (req, res) => {

  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    await client.otp.create({
      data: {
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), 
        email
      },
    });

    const msg = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your login</title>
  <!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
</head>

<body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
  <table role="presentation"
    style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
    <tbody>
      <tr>
        <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
          <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
            <tbody>
              <tr>
                <td style="padding: 40px 0px 0px;">
                  <div style="text-align: left;">
                    <div style="padding-bottom: 20px;"><img src="https://i.ibb.co/6yJ9p9N/ZMetaverse.png" alt="Z Metaverse"
                        style="width: 220px;"></div>
                  </div>
                  <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                    <div style="color: rgb(0, 0, 0); text-align: left;">
                      <h1 style="margin: 1rem 0">Verification code</h1>
                      <p style="padding-bottom: 16px">Please use the verification code below to sign in.</p>
                      <p style="padding-bottom: 16px"><strong style="font-size: 130%">${otp}</strong></p>
                      <p style="padding-bottom: 16px">If you didn't request this, you can ignore this email.</p>
                      <p style="padding-bottom: 16px">Thanks,<br>The Mailmeteor team</p>
                    </div>
                  </div>
                  <div style="padding-top: 20px; color: rgb(153, 153, 153); text-align: center;">
                    <p style="padding-bottom: 16px">Made with ♥ By Aditya Bansal</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>

</html>
    `;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${otp} is your METAVERSE login code`,
      html: msg,
    };

    await transporter.sendMail(mailOptions);

    const newUser = !await checkUserByEmail(email);

    res.json({ newUser, message: "OTP sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending OTP. Please try again." });
  }

});
router.post("/verify-otp", async (req, res) => {
  let { email, otp } = req.body;

  otp = parseInt(otp);

  try {
    const otpRecord = await client.otp.findFirst({
      where: {
        email,
        otp,
      },
    });

    if (!otpRecord) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    // Check if the OTP has expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      res.status(400).json({ message: "OTP has expired" });
      return;
    }

    await client.otp.delete({
      where: {
        id: otpRecord.id,
      },
    });

    res.json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying OTP. Please try again." });
  }
});

router.get("/elements", async (req, res) => {
  const elements = await client.element.findMany();
  res.json({
    elements: elements.map(e => {
      return {
        id: e.id,
        imageUrl: e.imageUrl,
        width: e.width,
        height: e.height,
        static: e.static
      }
    })
  })
})

router.get("/avatars", async (req, res) => {
  const avatars = await client.avatar.findMany();
  res.json({
    avatars: avatars.map(a => {
      return {
        id: a.id,
        imageUrl: a.imageUrl,
      }
    })
  })
})

router.use("/user", userRouter)
router.use("/auth", authRouter)
router.use("/space", spaceRouter)
router.use("/admin", adminRouter)