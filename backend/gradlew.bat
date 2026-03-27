@rem
@rem Copyright 2015 the original author or authors.
@rem
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem      https://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.
@rem
@rem SPDX-License-Identifier: Apache-2.0
@rem

@if "%DEBUG%"=="" @echo off
@rem ##########################################################################
@rem
@rem  Gradle startup script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
@rem This is normally unused
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@rem Resolve any "." and ".." in APP_HOME to make it shorter.
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@rem Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"

@rem Find Java 17 without requiring JAVA_HOME/PATH.
@rem 1) Prefer project-local JDK: backend\.jdk\bin\java.exe
set "JAVA_EXE="
if exist "%APP_HOME%\.jdk\bin\java.exe" set "JAVA_EXE=%APP_HOME%\.jdk\bin\java.exe"
if defined JAVA_EXE goto execute

@rem 2) Try common Windows JDK install locations.
for /d %%D in ("%ProgramFiles%\Eclipse Adoptium\jdk-17*" "%ProgramFiles%\Java\jdk-17*" "%ProgramFiles%\Microsoft\jdk-17*" "%ProgramFiles%\Amazon Corretto\jdk17*" "%ProgramFiles%\Zulu\zulu-17*") do (
  if exist "%%~fD\bin\java.exe" (
    set "JAVA_EXE=%%~fD\bin\java.exe"
    goto execute
  )
)

echo. 1>&2
echo ERROR: Java 17 not found. 1>&2
echo. 1>&2
echo Install JDK 17, or place it at "%APP_HOME%\.jdk". 1>&2
echo Then run gradlew again. 1>&2
goto fail

:execute
@rem Setup the command line

set CLASSPATH=%APP_HOME%\gradle\wrapper\gradle-wrapper.jar


@rem Execute Gradle
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*

:end
@rem End local scope for the variables with windows NT shell
if %OS%==Windows_NT endlocal

:omega
@rem ##########################################################################
@rem
@rem  End of the Gradle startup script
@rem
@rem ##########################################################################
exit /b %ERRORLEVEL%

:fail
exit /b 1
