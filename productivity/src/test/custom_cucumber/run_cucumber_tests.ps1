$files = Get-ChildItem "%teamcity.build.workingDir%\www\src\test\features\"

for ($i=0; $i -lt $files.Count; $i++) {
    $outfile = $files[$i].FullName
	
	cd %teamcity.build.workingDir%
	
	$command = 'node_modules/.bin/cucumber-js ' + $outfile + ' --format=www\src\test\features\formatters\teamcityListener.js'
    iex $command
	#echo $command
}