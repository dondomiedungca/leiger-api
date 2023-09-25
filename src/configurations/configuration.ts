export default () => ({
  APP_URL: 'http://localhost:3000',
  APP_TITLE: 'Leiger API',
  environment: 'production',
  PORT: 3000,
  token: {
    saltRound: 10,
    exp: {
      access: {
        months: 0,
        days: 15,
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
      refresh: {
        months: 12,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
      meeting: {
        months: 0,
        days: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
    },
  },
  PRIVATE_KEY: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCe7J8ZJHFWhiKW
LaAwNsiGeKfyasOGF3u+QxtWLtp9M6HSO3Pg5aojuAmhXh5I5Ksol1BndD9GuMWW
sqS2eptOznvLwWNRCDLSqcpOsYv6CJv7dZOVGtrLjZMz2ORK1ASqFoVTaJL8k21R
4Or+Fygi8uQpSHWmksdva4+Ig1wtL95pJenGvs+njMkh3MY77Huj0XDwv6RYU0xM
u2sveZZDqicjLhU99F+P5OucHA7lWEswnpYtlSQ3NhxNVhCSJG1McAEykcHcAkoW
spNebWyEwBys7H8ugF9hGCJ+p5eBGaW8oWxoboDjDmN0l4wWsMKGnOYPTaKdIQG/
jqkX1y6/AgMBAAECggEADPSQIa4RWTLVFfYBNXz5ytCCLGZcqw02BrQUwelO4V74
pZk4IJDIVmIV0uRHxrxxYX04Tj6xO9QrM1Y7zC5hg8KcX+dTb9MhxX+W4ORjW04h
XRXgIosOZAKWCed38Muo166/TqXbOaDRDBgwP+dmW7b+N4lTIfGcNW6IxGGk/X/k
/4TOBRH7hvGFR1pDURF/92b8aTlQSRzRTUstTezBtSDqWtCcgPyj6W9rkd8fSFte
iStlSPnT0qJjSHKWy5ztn43UTaCMHu+wDujtwwiACSVHfc50AnD7wCkwiUxCLSab
XYxxdu0+TCXpwq5mnFTOQLCIikM22/GQH8eUUvJDlQKBgQDZzDt2s5cXMRZe+Ue1
jGPut7dR9D2ErTK6+GeKU5uQP5LHEEfsvS00M+95uxLk109n0yalUyseiXC7auAO
9Dl9qs/N7fuH+1MqDtAESgKPIhjget3Vpr0tD1nspmV+v5r5OLnN8uLn4/dzWDwU
VYHKccYAC9XZ/sOjK/TSXvASswKBgQC6zMuETqURhW89h4FQo81oDekDr+zV+YP6
GJNK63AFr6FtQ5vlAZ8jl8q//qnliJnL1e/PGfKSueh1SA1wOZ2JqdiO6ZkvYm4m
KNpbVJ1RmkVCzdcWKifcwWTbwpv3rE0428t9nitkaXsK0gFeXwEVeqaWJQWjVMRX
WTo89A2JxQKBgQCHNSeRKCpbBmk56o0e4pnDP5/5q6NpM1B0C/PTRtYjNaQ8Ghpc
mJBwgPFg48b188hizw2FwtzY5z/pyY5xGiJ6pki9McleAKL/UBTJJNzz2JoS+ZOv
qAR27bnIlQAbMH3Xy+RlOyysArTCkXsysGaTtA/URYSsAWGYcZhZ5QAqywKBgDw0
OPuBZU4KVVndTF4zDMaWhRz9HDWyX0jBluc0jjwm6L4QZjQem62bBGtwpk0mA3tg
jhOPZ1DGvhbejAY5a36s0PDudMKC1MFTtVxuHu3n7J6lPMcV+xb49YqmZCIk1BaZ
MDJiQdXw8QkBuhMyR2UmzH3jnLeRYF5OkaiHd72JAoGBAKSv+0VnKa+tW/3ameBF
oFLdA/oyMwM/Sh72378FVOkapHykDPQrE4oaLL+GIuUZSHtBNCexcPDFJirdVKIu
NnjoZYi4HvktoI1+jnmG/xdd9GgBLVJ/3pL6fRSRtoZFN8nA4F/Jg9hV2AXH0IbG
Ne5MhCJzRzb+6bKbPS0s0LEJ
-----END PRIVATE KEY-----`,
  PUBLIC_KEY: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnuyfGSRxVoYili2gMDbI
hnin8mrDhhd7vkMbVi7afTOh0jtz4OWqI7gJoV4eSOSrKJdQZ3Q/RrjFlrKktnqb
Ts57y8FjUQgy0qnKTrGL+gib+3WTlRray42TM9jkStQEqhaFU2iS/JNtUeDq/hco
IvLkKUh1ppLHb2uPiINcLS/eaSXpxr7Pp4zJIdzGO+x7o9Fw8L+kWFNMTLtrL3mW
Q6onIy4VPfRfj+TrnBwO5VhLMJ6WLZUkNzYcTVYQkiRtTHABMpHB3AJKFrKTXm1s
hMAcrOx/LoBfYRgifqeXgRmlvKFsaG6A4w5jdJeMFrDChpzmD02inSEBv46pF9cu
vwIDAQAB
-----END PUBLIC KEY-----`,
  database: {
    host: process.env.MONGODB_URL,
  },
});
