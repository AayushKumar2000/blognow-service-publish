const mysql = require('mysql2');


const con = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: "blog_now"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});



module.exports.createBlogPublishTable = async () => {
    let sql = 'SHOW TABLES';
    try {
        let result = await con.promise().query(sql)
        const x = result[0].map((y) => y['Tables_in_blog_now'])
		
		console.log(x)

        if (!x.includes('BlogPublish')) {
            sql = `Create table BlogPublish (
            blogID varchar(40) PRIMARY KEY,
            blogContent TEXT NOT NULL,
            user varchar(30) NOT NULL,
            blogTitle varchar(300) NOT NULL,
            visibilityType varchar(10) NOT NULL default 'PRIVATE',
            views int default 0,
            likes int default 0,
            date varchar(15) NOT NULL
           )`

            result = await con.promise().query(sql)

        }
    } catch (e) {
        console.error(e)
        process.exit(1)
    }

}






module.exports.insertBlog = async (blogID,user, title,blogContent , type) => {

    const date = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })

    const sql = `INSERT INTO BlogPublish (blogID,user,blogTitle,blogContent,visibilityType,date) VALUES ('${blogID}','${user}','${title}','${blogContent}','${type}','${date}')`;
    const result = await con.promise().query(sql);

    return result[0].affectedRows

}

module.exports.insertBlog2 = async (blogId,user, title, blogContent, type) => {

    const date = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })

    const sql = `UPDATE BlogPublish SET blogTitle='${title}',blogContent='${blogContent}',visibilityType='${type}',date='${date}' WHERE blogID='${blogId}' `;
    const result = await con.promise().query(sql);

    return result[0].affectedRows

}

const viewCounterUpdate = (blogID)=>{
    let sql = `UPDATE BlogPublish SET views=views+1 WHERE blogID='${blogID}'`
    con.promise().query(sql);
}


module.exports.getBlog = async (blogID) => {
    const sql = `SELECT * FROM BlogPublish WHERE  blogID='${blogID}'`;
    const [rows] = await con.promise().query(sql)
    viewCounterUpdate(blogID)
     console.log(rows[0])
    return rows[0];
}




module.exports.updateLikeCount = async (blogID) => {
    let sql = `UPDATE BlogPublish SET likes=likes+1 WHERE blogID='${blogID}' `
    const result = await con.promise().query(sql);

    return result[0].affectedRows
}

module.exports.updateBlogVisibility = async (blogID) => {
    let sql = `UPDATE BlogPublish SET visibilityType='${type}' WHERE blogID='${blogID}'`
    const result = await con.promise().query(sql);

    return result[0].affectedRows
}