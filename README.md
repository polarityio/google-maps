# Polarity Google Maps Integration

Polarity's Google Maps integration displays a google map for any recognized street addresses or latitude longitude pairs.

## Google Maps Settings

The google-maps integration has one required option which is the `API Key`

### API Key

Your google maps API Key

## Installation Instructions

You can install an integration by downloading the file from github, or by using git to clone the repo into your instance.

### Install from Zip/Tar File

1. Navigate to the [polarityio/google-maps releases page](https://github.com/polarityio/google-maps/releases).
2. Download the `tar.gz` file for the version of the integration you want to install (we typically recommend installing the latest version of the integration).
3. Upload the `tar.gz` file to your Polarity Server.
4. Move the `tar.gz` file to the Polarity Server integrations directory.

 ```bash
 mv <filename> /app/polarity-server/integrations
 ```

5. Once the file has been moved, navigate to the integrations folder:

 ```bash
 cd /app/polarity-server/integrations
 ```
  
6. Extract the tar file:

 ```bash
 tar -xzvf <filename>
 ```

6. Navigate into the extracted folder for the new integration:

 ```bash
cd <filename>
```

7. Install the integration's dependencies:

 ```bash
npm install
```

8. Ensure the integration directory is owned by the `polarityd` user
 
 ```bash
chown -R polarityd:polarityd /app/polarity-server/integrations/google-maps
```

9. Restart your Polarity-Server

 ```bash
service polarityd restart
```

10. Navigate to the integrations page in Polarity-Web to configure the integration.

### Installing via GIT Clone

1. Navigate to the integrations folder:

 ```bash
cd /app/polarity-server/integrations
```

2. Clone a specific version of the wikipedia repo using git:

 ```bash
git clone --branch <version> https://github.com/polarityio/google-maps.git
```

3. Change into the integration directory

 ```bash
cd wikipedia
```

4. Use `npm` to install the integration's dependencies

 ```bash
npm install
```

5.  Ensure the integration directory is owned by the `polarityd` user

 ```bash
chown -R polarityd:polarityd /app/polarity-server/integrations/google-maps
```

6. Restart your Polarity-Server

 ```bash
service polarityd restart
```

7. Navigate to the integrations page in Polarity-Web to configure the integration

## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making.  For more information about the Polarity platform please see: 

https://polarity.io/
