$base='http://localhost:8088/parttime_hiring_platform'
$paths=@('/api/jobs','/api/jobs/categories','/api/jobs/shifts','/api/jobs/search','/api/jobs/1','/api/users/me','/api/users/applications/my-applications','/api/users/employer-verifications/my-status','/api/employer/dashboard/overview','/api/employer/me/profile','/api/employer/stores','/api/employer/jobs','/api/employer/applications','/api/employer/employments','/api/employer/employments?storeId=1','/api/admin/dashboard/stats','/api/admin/users','/api/admin/employers','/api/admin/jobs','/api/admin/stores','/api/admin/categories','/api/admin/shifts','/api/admin/reviews','/api/admin/verifications?status=PENDING')
$rows=@()
foreach($role in @('guest','user_test','employer','admin')) {
 $session=New-Object Microsoft.PowerShell.Commands.WebRequestSession
 if($role -ne 'guest') { $password=if($role -eq 'user_test'){'UserTest@123'}else{$role}; $null=Invoke-RestMethod ($base+'/api/auth/login') -Method Post -ContentType 'application/json' -Body (@{username=$role;password=$password}|ConvertTo-Json) -WebSession $session }
 foreach($path in $paths) {
  $r=Invoke-WebRequest ($base+$path) -WebSession $session -SkipHttpErrorCheck -MaximumRedirection 0 -ErrorAction SilentlyContinue
  $code=''; $count=''; try {$data=$r.Content|ConvertFrom-Json; $code=$data.code; if($data.result -is [array]){$count=$data.result.Count}elseif($null -ne $data.result.totalElements){$count=$data.result.totalElements}}catch{}
  $rows += [pscustomobject]@{role=$role;path=$path;http=[int]$r.StatusCode;code=$code;count=$count}
 }
}
$rows | Export-Csv audit/api-results.csv -NoTypeInformation -Encoding utf8
$rows | Format-Table -AutoSize
