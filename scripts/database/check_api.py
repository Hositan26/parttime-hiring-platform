"""Smoke-test only demo identities through real cookie/CSRF API authentication."""

import argparse
from http.cookiejar import CookieJar
import json
import os
import urllib.error
import urllib.request

from manage import BACKUPS as LOCAL, DEV, execute


class BrowserSession:
    def __init__(self, base):
        self.base = base.rstrip("/")
        self.client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(CookieJar()))

    def request(self, path, body=None, method="GET"):
        headers = {}
        if method != "GET":
            status, csrf = self.request("/api/auth/csrf")
            assert status == 200
            headers["X-XSRF-TOKEN"] = csrf["result"]
            headers["Content-Type"] = "application/json"
        payload = json.dumps(body).encode() if body is not None else None
        request = urllib.request.Request(self.base + path, data=payload, method=method, headers=headers)
        try:
            response = self.client.open(request, timeout=15)
        except urllib.error.HTTPError as failure:
            response = failure
        data = response.read()
        if "application/json" in response.headers.get("Content-Type", ""):
            data = json.loads(data)
        return response.status, data

    def login(self, username, password):
        return self.request("/api/auth/login", {"username": username, "password": password}, "POST")


def check(base, password):
    results = {}
    guest = BrowserSession(base)
    status, image = guest.request("/demo/store-01.png")
    assert status == 200 and image.startswith(b"\x89PNG\r\n\x1a\n")
    assert guest.request("/demo/resumes/candidate-01.pdf")[0] != 200
    assert guest.request("/demo/../resumes/candidate-01.pdf")[0] != 200
    results["demo_images_and_private_resume_boundary"] = "passed"
    status, page = guest.request("/api/jobs/page")
    assert status == 200 and page["result"]["totalElements"] >= 44
    results["public_jobs"] = page["result"]["totalElements"]
    assert guest.request("/api/admin/users")[0] == 401
    sessions = {}
    for role, username in [("admin", "demo_admin_01"), ("employer", "demo_employer_01"),
                           ("candidate", "demo_user_01"), ("other_employer", "demo_employer_02")]:
        session = BrowserSession(base)
        status, account = session.login(username, password)
        assert status == 200, f"Login failed for demo {role}: HTTP {status}"
        expected = "ADMIN" if role == "admin" else "USER" if role == "candidate" else "EMPLOYER"
        assert expected in account["result"]["roles"]
        sessions[role] = session
        results[f"{role}_login"] = "passed"
    status, stats = sessions["admin"].request("/api/admin/dashboard/stats")
    assert status == 200 and stats["result"]["totalApplications"] >= 120
    results["admin_dashboard"] = stats["result"]
    status, overview = sessions["employer"].request("/api/employer/dashboard/overview")
    assert status == 200
    results["employer_dashboard"] = "passed"
    assert sessions["employer"].request("/api/admin/users")[0] == 403
    assert sessions["candidate"].request("/api/admin/users")[0] == 403
    status, applications = sessions["candidate"].request("/api/users/applications/my-applications")
    assert status == 200
    assert sessions["candidate"].request("/api/users/employments")[0] == 200
    assert sessions["candidate"].request("/api/candidate-profiles/me")[0] == 200
    status, document = sessions["candidate"].request("/api/candidate-profiles/me/resume")
    assert status == 200 and document.startswith(b"%PDF-")
    results["candidate_profile_applications_employment_and_cv"] = "passed"
    application_id = execute("SELECT a.application_id FROM job_applications a JOIN users u ON u.user_id=a.applicant_user_id JOIN job_posts j ON j.job_post_id=a.job_post_id JOIN employers e ON e.employer_id=j.employer_id JOIN users owner ON owner.user_id=e.user_id WHERE u.username='demo_user_01' AND owner.username='demo_employer_01' ORDER BY a.application_id LIMIT 1;", DEV)
    path = f"/api/candidate-profiles/applications/{application_id}/resume"
    assert sessions["employer"].request(path)[0] == 200
    assert sessions["other_employer"].request(path)[0] == 403
    assert guest.request(path)[0] == 401
    results["cv_ownership_boundaries"] = "passed"
    locked = BrowserSession(base)
    assert locked.login("demo_user_39", password)[0] == 401
    results["disabled_demo_account"] = "passed"
    for session in sessions.values():
        assert session.request("/api/auth/logout", {}, "POST")[0] == 200
    assert sessions["admin"].request("/api/admin/users")[0] == 401
    results["logout"] = "passed"
    LOCAL.mkdir(exist_ok=True)
    (LOCAL / "api-verification.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://localhost:8088/parttime_hiring_platform")
    args = parser.parse_args()
    password = os.environ.get("DEMO_SEED_PASSWORD")
    if not password:
        raise SystemExit("Set DEMO_SEED_PASSWORD; credential values will not be printed")
    print(json.dumps(check(args.base_url, password), ensure_ascii=False, indent=2))
