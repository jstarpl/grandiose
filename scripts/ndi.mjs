/*
  Copyright (c) 2021 Dr. Ralf S. Engelschall

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

/*  external requirements  */

import path from 'node:path'
import os from 'node:os'
import shell from 'shelljs'
import { execa } from 'execa'
import zip from 'cross-zip'
import tmp from 'tmp'
import spawn from 'cross-spawn'

/* Check if supported platform and continue only if it is */
if (os.platform() === "darwin" || os.platform() === "linux" ||
    (os.platform() === "win32" && ["ia32", "x64"].includes(os.arch()))) {
    console.log("++ ad-hoc assembling NDK SDK distribution subset from original sources")
    if (os.platform() === "win32") {
        /*  download innoextract utility  */
        const url1 = "https://constexpr.org/innoextract/files/innoextract-1.9-windows.zip"
        console.log("-- downloading innoextract utility")
        // const data1 = await got(url1, { responseType: "buffer" })
        const file1 = tmp.tmpNameSync()
        console.log(file1)        
        // await fs.promises.writeFile(file1, data1.body, { encoding: null })
        await execa("curl", ['-L', url1, '-o', file1],
            { stdin: "inherit", stdout: "inherit", stderr: "inherit" }
        )

        /*  extract innoextract utility  */
        console.log("-- extracting innoextract utility")
        const dir1 = tmp.tmpNameSync()
        zip.unzipSync(file1, dir1)

        /*  download NDI SDK distribution  */
        const url2 = "https://downloads.ndi.tv/SDK/NDI_SDK/NDI%205%20SDK.exe"
        console.log("-- dowloading NDI SDK distribution")
        // const data2 = await got(url2, { responseType: "buffer" })
        const file2 = tmp.tmpNameSync()
        // await fs.promises.writeFile(file2, data2.body, { encoding: null })
        await execa("curl", ['-L', url2, '-o', file2],
            { stdin: "inherit", stdout: "inherit", stderr: "inherit" }
        )

        /*  extract NDI SDK distribution  */
        console.log("-- extracting NDI SDK distribution")
        const dir2 = tmp.tmpNameSync()
        shell.mkdir("-p", dir2)
        await execa(path.join(dir1, "innoextract.exe"), ["-s", "-d", dir2, file2],
            { stdin: "inherit", stdout: "inherit", stderr: "inherit" })

        /*  assemble NDI SDK subset  */
        console.log("-- assembling NDI SDK subset")
        shell.rm("-rf", "ndi")
        shell.mkdir("-p", "ndi/include")
        shell.mkdir("-p", "ndi/lib/win-x86")
        shell.mkdir("-p", "ndi/lib/win-x64")
        shell.cp("-r", path.join(dir2, "app/Include/"), "ndi")
        shell.cp(path.join(dir2, "app/Lib/x86/Processing.NDI.Lib.x86.lib"), "ndi/lib/win-x86/Processing.NDI.Lib.x86.lib")
        shell.cp(path.join(dir2, "app/Bin/x86/Processing.NDI.Lib.x86.dll"), "ndi/lib/win-x86/Processing.NDI.Lib.x86.dll")
        shell.cp(path.join(dir2, "app/Lib/x64/Processing.NDI.Lib.x64.lib"), "ndi/lib/win-x64/Processing.NDI.Lib.x64.lib")
        shell.cp(path.join(dir2, "app/Bin/x64/Processing.NDI.Lib.x64.dll"), "ndi/lib/win-x64/Processing.NDI.Lib.x64.dll")

        /*  remove temporary files  */
        console.log("-- removing temporary files")
        shell.rm("-f", file1)
        shell.rm("-f", file2)
        shell.rm("-rf", dir1)
        shell.rm("-rf", dir2)
    }
    else if (os.platform() === "darwin") {
        /*  download NDI SDK distribution  */
        const url1 = "https://downloads.ndi.tv/SDK/NDI_SDK_Mac/Install_NDI_SDK_v5_macOS.pkg"
        console.log("-- dowloading NDI SDK distribution")
        // const data1 = await got(url1, { responseType: "buffer" })
        const file1 = tmp.tmpNameSync()
        // await fs.promises.writeFile(file1, data1.body, { encoding: null })
        await execa("curl", [url1, '-o', file1],
            { stdin: "inherit", stdout: "inherit", stderr: "inherit" }
        )

        /*  extract NDI SDK distribution  */
        console.log("-- extracting NDI SDK distribution")
        const dir1 = tmp.tmpNameSync()
        shell.rm("-rf", dir1)
        await execa("pkgutil", ["--expand", file1, dir1],
            { stdin: "inherit", stdout: "inherit", stderr: "inherit" })
        await execa("cpio", ["-idmu", "-F", path.join(dir1, "NDI_SDK_Component.pkg/Payload")],
            { cwd: dir1, stdin: "inherit", stdout: "ignore", stderr: "ignore" })

        /*  assemble NDI SDK subset  */
        console.log("-- assembling NDI SDK subset")
        shell.rm("-rf", "ndi")
        shell.mkdir("-p", "ndi/include")
        shell.mkdir("-p", "ndi/lib/mac_universal")
        shell.mv(path.join(dir1, "NDI SDK for macOS/include/*.h"), "ndi/include/")
        shell.mv(path.join(dir1, "NDI SDK for macOS/lib/macOS/*.dylib"), "ndi/lib/mac_universal/")
        shell.mv(path.join(dir1, "NDI SDK for macOS/lib/macOS/libndi_licenses.txt"), "ndi/lib/mac_universal/")

        /*  remove temporary files  */
        console.log("-- removing temporary files")
        shell.rm("-f", file1)
        shell.rm("-rf", dir1)
    }
    else if (os.platform() === "linux") {
        /*  download NDI SDK distribution  */
        const url1 = "https://downloads.ndi.tv/SDK/NDI_SDK_Linux/Install_NDI_SDK_v5_Linux.tar.gz"
        console.log("-- dowloading NDI SDK distribution")
        // const data1 = await got(url1, { responseType: "buffer" })
        const file1 = tmp.tmpNameSync()
        // await fs.promises.writeFile(file1, data1.body, { encoding: null })
        await execa("curl", [url1, '-o', file1],
            { stdin: "inherit", stdout: "inherit", stderr: "inherit" }
        )

        /*  extract NDI SDK distribution  */
        console.log("-- extracting NDI SDK distribution")
        const dir1 = tmp.tmpNameSync()
        shell.mkdir("-p", dir1)
        await execa("tar", ["-z", "-x", "-C", dir1, "-f", file1],
            { stdin: "inherit", stdout: "inherit", stderr: "inherit" })
        await execa("sh", ["-c", `echo "y" | PAGER=cat sh Install_NDI_SDK_v5_Linux.sh`],
            { cwd: dir1, stdin: "inherit", stdout: "ignore", stderr: "inherit" })

        /*  assemble NDI SDK subset  */
        console.log("-- assembling NDI SDK subset")
        shell.rm("-rf", "ndi")
        shell.mkdir("-p", "ndi/include")
        shell.mkdir("-p", "ndi/lib/lnx-x86")
        shell.mkdir("-p", "ndi/lib/lnx-x64")
        shell.mkdir("-p", "ndi/lib/lnx-armv7l")
        shell.mkdir("-p", "ndi/lib/lnx-arm64")
        shell.mv(path.join(dir1, "NDI SDK for Linux/include/*.h"), "ndi/include/")
        shell.mv(path.join(dir1, "NDI SDK for Linux/lib/i686-linux-gnu/*"), "ndi/lib/lnx-x86/")
        shell.mv(path.join(dir1, "NDI SDK for Linux/lib/x86_64-linux-gnu/*"), "ndi/lib/lnx-x64/")
        shell.mv(path.join(dir1, "NDI SDK for Linux/lib/arm-rpi4-linux-gnueabihf/*"), "ndi/lib/lnx-armv7l/")
        shell.mv(path.join(dir1, "NDI SDK for Linux/lib/aarch64-rpi4-linux-gnueabi/*"), "ndi/lib/lnx-arm64/")

        /*  remove temporary files  */
        console.log("-- removing temporary files")
        shell.rm("-f", file1)
        shell.rm("-rf", dir1)
    }
    // Spawn build script
    console.log("Preparing to build")
    spawn.sync("npm", ["run", process.platform === "linux" && process.env.npm_config_target_arch === "arm" ? "build:arm" : "build"], {
        input: "Native module build required.",
        stdio: "inherit"
    })
}
