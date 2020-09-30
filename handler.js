'use strict'
const AWS = require('aws-sdk')

module.exports = {
    create: async (event, context) =>{
        let bodyObj = {}
        try{
            bodyObj = JSON.parse(event.body)
        }
        catch ( jsonError ) {
            console.log('There was an error parsing the request body',jsonError)
            return {
                statusCode: 400
            }
        }
        if (typeof bodyObj.name === 'undefined' ||
            typeof bodyObj.age === 'undefined')
        {
            console.log('Missing parameters')
            return {
                statusCode: 400
            }
        }
        let putParams ={
            TableName: process.env.DYNAMODB_STUDENT_TABLE,
            Item: {
                name: bodyObj.name,
                age: bodyObj.age
            }
        }
        let putResult = {}
        try {
            let dynamodb = new AWS.DynamoDB.DocumentClient()
            putResult = await dynamodb.put(putParams).promise()
        }
        catch(putError){
            console.log("There was a problem in putting the student",putError)
            return {
                statusCode: 500
            }
        }
        return {
            statusCode: 201
        }
    },

    list: async (event, context) =>{
        let scanParams = {
            TableName: process.env.DYNAMODB_STUDENT_TABLE
        }
        let scanResult = {}
            try {
                let dynamodb = new AWS.DynamoDB.DocumentClient()
                scanResult = await dynamodb.scan(scanParams).promise()
            } catch(scanError){
                console.log("There was a problem in scanning the student", scanError)
                return {
                    statusCode: 500
                }
            }
            if (scanResult.Items === null ||
                !Array.isArray(scanResult.Items) ||
                scanResult.Items.length === 0)
            {
                return {
                    statusCode: 404
                }
            }
            return {
                statusCode: 200,
                body: JSON.stringify(scanResult.Items.map(student =>{
                    return{
                        name: student.name,
                        age: student.age
                    }
                }))
            }
    },

    get: async (event, context) =>{
        console.log("The name of event is:",event.pathParameters.name)
        let getParams = {
            TableName: process.env.DYNAMODB_STUDENT_TABLE,
            Key: {
                "name": event.pathParameters.name
            }
        }
        console.log(getParams)
        let getResult = {}
        try {
            let dynamodb = new AWS.DynamoDB.DocumentClient()
            getResult = await dynamodb.get(getParams).promise()
        } catch(getError){
            console.log("There was a problem while fetching the details", getError)
        }
        if (getResult.Item === null){
            return { statusCode: 404}
        }
        return {
            statusCode: 200,
            body: JSON.stringify(getResult)
        }
    },

    update: async (event, context) =>{
        let bodyObj = {}
        try{
            bodyObj = JSON.parse(event.body)
        }
        catch ( jsonError ) {
            console.log('There was an error parsing the request body',jsonError)
            return {
                statusCode: 400
            }
        }
        if (typeof bodyObj.age === 'undefined')
        {
            console.log('Missing parameters')
            return {
                statusCode: 400
            }
        }
        let updateParams = {
            TableName: process.env.DYNAMODB_STUDENT_TABLE,
            Key: {
                "name": event.pathParameters.name
            },
            UpdateExpression: 'set age = :age',
            ExpressionAttributeValues:{
                ':age':bodyObj.age
            }
        }
        let updateResult = {}
        try {
            let dynamodb = new AWS.DynamoDB.DocumentClient()
            await dynamodb.update(updateParams).promise()
        } catch(updateError){
            console.log("There was a problem while updating the details", updateError)
        }
        return {
            statusCode: 200
        }
    },

    delete: async (event, context) =>{
        let deleteParams = {
            TableName: process.env.DYNAMODB_STUDENT_TABLE,
            Key: {
                "name": event.pathParameters.name
            }
        }
        let deleteResult = {}
        try {
            let dynamodb = new AWS.DynamoDB.DocumentClient()
            deleteResult = await dynamodb.delete(deleteParams).promise()
            console.log(deleteResult)
        } catch(deleteError){
            console.log("There was a problem while deleting the details", deleteError)
        }
        return {
            statusCode: 200
        }

    },
}
