const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'naufalahmadfauz@gmail.com',
        subject:'Selamat Datang Di Aplikasi Masak Masak!',
        text:`Selamat datang ${name},di aplikasi Masak Masak, Terimakasih telah bergabung!`
    })
}

const sendCancelationEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'naufalahmadfauz@gmail.com',
        subject:'Terimakasih dan Selamat Jalan!',
        text:`Terimakasih ${name} Telah menjadi bagian dari aplikasi Masak Masak. Beritahu kami agar aplikasi kami dapat menjadi lebih baik`
    })
}

module.exports = {sendWelcomeEmail,sendCancelationEmail}