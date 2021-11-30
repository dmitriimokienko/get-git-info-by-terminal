'use strict';

process.on('unhandledRejection', (err) => {
    throw err;
});

const execSync = require('child_process').execSync;

function getExecCommand() {
    if (process.platform === 'win32') {
        return 'git log --format=^%D^%n^%h^%n^%H^%n^%cI^%n^%B -n 1 HEAD';
    }
    return 'git log --format=%D%n%h%n%H%n%cI%n%B -n 1 HEAD';
}

function getRefs(data) {
    let branch = '-';
    let tag = '-';
    if (typeof data !== 'string') {
        return { branch, tag };
    }
    const refs = data.split(', ');
    for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];
        if (ref.indexOf('tag') !== -1) {
            tag = ref.replace(/tag: /, '').trim();
        }
        if (ref.indexOf('HEAD') !== -1) {
            branch = ref.replace(/HEAD ->/, '').trim();
        }
    }
    return { branch, tag };
}

function execute(cmd) {
    let data;
    let err;
    try {
        data = execSync(cmd).toString();
    } catch (error) {
        err = `GitInfo exec error: '${error.message}'`;
        console.log(err);
    }
    return [err, data];
}

const [err, result] = execute(getExecCommand());
if (!err) {
    const info = result.split(/\n/) || [];
    const refs = getRefs(info[0]);

    console.log('GitInfo:: ', {
        branch: refs.branch,
        tag: refs.tag,
        hash: info[2],
        commitMessage: info[4],
    });
}
